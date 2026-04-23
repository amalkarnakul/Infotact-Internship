const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatWithGroq = async (messages) => {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    });
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq error:', error.message);
    throw new Error('Failed to get response from Groq');
  }
};

module.exports = { chatWithGroq };
