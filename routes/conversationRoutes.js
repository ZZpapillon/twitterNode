const express = require('express');
const { startConversation, getConversations } = require('../controllers/conversationController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/conversations', verifyToken, startConversation);
router.get('/conversations', verifyToken, getConversations);

module.exports = router;