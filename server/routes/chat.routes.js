const express = require('express');
const router = express.Router();
const { getChats, createChat, getChatMessages, sendMessage, deleteChat } = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', getChats);
router.post('/', createChat);
router.get('/:chatId/messages', getChatMessages);
router.post('/message', sendMessage);
router.delete('/:chatId', deleteChat);

module.exports = router;
