const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const chatWithGemini = async (messages) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  } catch (error) {
    console.error('Gemini error:', error.message);
    throw new Error('Failed to get response from Gemini');
  }
};

module.exports = { chatWithGemini };
