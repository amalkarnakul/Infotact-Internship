const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const { chatWithGroq } = require('../services/groqService');
const { chatWithGemini } = require('../services/geminiService');
const { getRelevantChunks, buildRAGPrompt } = require('../services/ragService');

// Get all chats for user
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new chat
const createChat = async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await Chat.create({ user: req.user._id, title: title || 'New Chat' });
    res.status(201).json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a chat
const getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, user: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const messages = await Message.find({ chat: chat._id }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { chatId, content, model = 'groq', useRAG = false } = req.body;

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: req.user._id });
      if (!chat) return res.status(404).json({ message: 'Chat not found' });
    } else {
      chat = await Chat.create({
        user: req.user._id,
        title: content.slice(0, 50) || 'New Chat',
      });
    }

    // Save user message
    const userMessage = await Message.create({ chat: chat._id, role: 'user', content });
    chat.messages.push(userMessage._id);

    // Get conversation history
    const history = await Message.find({ chat: chat._id }).sort({ createdAt: 1 });
    let messages = history.map((m) => ({ role: m.role, content: m.content }));

    // RAG: inject document context if enabled
    if (useRAG) {
      const chunks = await getRelevantChunks(content, req.user._id);
      if (chunks.length) {
        const ragPrompt = buildRAGPrompt(chunks, content);
        messages[messages.length - 1].content = ragPrompt;
      }
    }

    // Get AI response
    let aiContent;
    if (model === 'gemini') {
      aiContent = await chatWithGemini(messages);
    } else {
      aiContent = await chatWithGroq(messages);
    }

    // Save assistant message
    const assistantMessage = await Message.create({
      chat: chat._id,
      role: 'assistant',
      content: aiContent,
    });
    chat.messages.push(assistantMessage._id);
    await chat.save();

    res.json({
      chatId: chat._id,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete chat
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.chatId, user: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    await Message.deleteMany({ chat: chat._id });
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChats, createChat, getChatMessages, sendMessage, deleteChat };
