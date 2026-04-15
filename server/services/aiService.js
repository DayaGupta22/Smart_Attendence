const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Generate personalized free-period activity suggestions for a student.
 */
const generateSuggestions = async ({ student, freePeriodDuration, date }) => {
  const systemPrompt = `You are an academic advisor AI embedded in a smart attendance system.
Your job is to suggest personalized, actionable activities for students during their free periods.
Always return valid JSON only — no prose, no markdown fences, just the raw JSON object.`;

  const userPrompt = `Student profile:
- Name: ${student.name}
- Department: ${student.department}
- Semester: ${student.semester}
- Interests: ${(student.interests || []).join(', ') || 'Not specified'}
- Strengths: ${(student.strengths || []).join(', ') || 'Not specified'}
- Weak subjects: ${(student.weakSubjects || []).join(', ') || 'Not specified'}
- Career goals: ${(student.careerGoals || []).join(', ') || 'Not specified'}

Free period duration: ${freePeriodDuration} minutes
Date: ${date}

Generate 3-4 personalized suggestions. Return ONLY a JSON object in this exact shape:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string (2-3 sentences)",
      "category": "academics|career|wellness|skill|goal",
      "resourceLinks": ["url1", "url2"],
      "estimatedMinutes": number,
      "priority": 1
    }
  ]
}

Rules:
- If weak subjects exist, include at least one academic suggestion targeting them.
- If career goals exist, include a career-aligned suggestion.
- Keep one wellness/break item if free period is >= 60 minutes.
- Suggest only real, publicly accessible resources (MDN, Khan Academy, LeetCode, Coursera etc.).
- estimatedMinutes should not exceed freePeriodDuration.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = message.content[0].text.trim();
  const parsed = JSON.parse(text);
  return parsed.suggestions || [];
};

module.exports = { generateSuggestions };
