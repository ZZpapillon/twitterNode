const express = require('express');
const { sendMessage, getMessages, getAllMessages } = require('../controllers/messageController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/messages', verifyToken, sendMessage);
router.get('/conversations/:conversationId/messages', verifyToken, getMessages);
router.get('/messages', verifyToken, getAllMessages);

module.exports = router;

