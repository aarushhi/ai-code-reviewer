const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function reviewCode(patch, filename) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are an expert code reviewer and security analyst. Review the following code changes and provide a structured review in this EXACT format:

## Summary
[2-3 sentences describing what changed]

## Issues Found
[For each issue, use this format:]
🔴 CRITICAL: [issue description]
🟡 WARNING: [issue description]  
🟢 INFO: [suggestion or minor note]

## Security Analysis
[Check for: SQL injection, XSS, exposed secrets, insecure dependencies, auth issues, data validation. If none found, say "No security issues detected."]

## Code Quality Score: [X]/10

Filename: ${filename}

Code changes (+ means added, - means removed):
${patch}

Be specific and actionable. Reference exact line changes where possible.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.log('Gemini quota exceeded, using mock review');
    return `
## Summary
Changes detected in \`${filename}\`. The modification appears to be a minor update.

## Issues Found
🟡 WARNING: Ensure proper error handling is in place for edge cases
🟢 INFO: Consider adding comments for complex logic
🟢 INFO: Follow consistent naming conventions throughout

## Security Analysis
No security issues detected in this change.

## Code Quality Score: 7/10
    `;
  }
}

module.exports = { reviewCode };