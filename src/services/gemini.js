const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function reviewCode(patch, filename) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are an expert code reviewer. Review the following code changes and provide:
1. A brief summary of what changed
2. Any bugs or issues you found
3. Suggestions for improvement
4. A code quality score out of 10

Filename: ${filename}

Code changes (+ means added, - means removed):
${patch}

Keep your review concise and developer-friendly.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    // Fallback mock review if API quota exceeded
    console.log('Gemini quota exceeded, using mock review');
    return `
**Summary:** Changes detected in \`${filename}\`.

**Issues Found:** None critical detected.

**Suggestions:**
- Ensure proper error handling is in place
- Add comments for complex logic
- Follow consistent naming conventions

**Code Quality Score: 7/10**

*Note: This is a mock review — Gemini API quota will be restored soon.*
    `;
  }
}

module.exports = { reviewCode };