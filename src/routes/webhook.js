const express = require('express');
const router = express.Router();
const { reviewCode } = require('../services/gemini');
const { Octokit } = require('@octokit/rest');

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

        for (const file of files) {
          if (file.patch) {
            console.log(`Reviewing ${file.filename}...`);
            const review = await reviewCode(file.patch, file.filename);
            fullReview += `### 📄 \`${file.filename}\`\n${review}\n\n---\n\n`;
          }
        }

        fullReview += `*Reviewed by AI Code Reviewer 🤖 — powered by Gemini*`;

        await octokit.issues.createComment({
          owner,
          repo: repoName,
          issue_number: prNumber,
          body: fullReview
        });

        console.log(`✅ Review posted on PR #${prNumber}!`);

      } catch (error) {
        console.error('Error:', error.message);
      }
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;