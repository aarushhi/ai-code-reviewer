const express = require('express');
const router = express.Router();
const { reviewCode } = require('../services/gemini');
const { Octokit } = require('@octokit/rest');
const Review = require('../models/review');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

router.post('/', async (req, res) => {
  const event = req.headers['x-github-event'];
  console.log(`✅ Received GitHub event: ${event}`);

  if (event === 'pull_request') {
    const action = req.body.action;
    const pr = req.body.pull_request;
    const repo = req.body.repository;
    const owner = repo.owner.login;
    const repoName = repo.name;
    const prNumber = pr.number;

    if (action === 'opened' || action === 'synchronize') {
      console.log(`PR ${action}: #${prNumber} - ${pr.title}`);

      try {
        const { data: files } = await octokit.pulls.listFiles({
          owner,
          repo: repoName,
          pull_number: prNumber
        });

        console.log(`Files changed: ${files.length}`);

        let fullReview = `## 🤖 AI Code Review\n\n`;
        let totalScore = 0;
        let scoreCount = 0;

        for (const file of files) {
          if (file.patch) {
            console.log(`Reviewing ${file.filename}...`);
            const review = await reviewCode(file.patch, file.filename);
            fullReview += `### 📄 \`${file.filename}\`\n${review}\n\n---\n\n`;

            // Extract score from review
            const scoreMatch = review.match(/(\d+)\/10/);
            if (scoreMatch) {
              totalScore += parseInt(scoreMatch[1]);
              scoreCount++;
            }
          }
        }

        fullReview += `*Reviewed by AI Code Reviewer 🤖 — powered by Gemini*`;

        const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 7;

        // Post comment on GitHub
        await octokit.issues.createComment({
          owner,
          repo: repoName,
          issue_number: prNumber,
          body: fullReview
        });

        console.log(`✅ Review posted on PR #${prNumber}!`);

        // Save to MongoDB
        await Review.create({
          repo: `${owner}/${repoName}`,
          pr_number: prNumber,
          pr_title: pr.title,
          pr_url: pr.html_url,
          files_reviewed: files.filter(f => f.patch).length,
          score: avgScore,
          summary: `${files.length} file(s) reviewed. Score: ${avgScore}/10`,
          full_review: fullReview,
          status: 'completed'
        });

        console.log(`✅ Review saved to MongoDB!`);

      } catch (error) {
        console.error('Error:', error.message);
      }
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;