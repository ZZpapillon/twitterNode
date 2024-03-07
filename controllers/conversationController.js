const Conversation = require('../models/conversation');

exports.startConversation = async (req, res) => {
  try {
    const { participants } = req.body;
    const conversation = new Conversation({ participants });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to start conversation', error: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id }).populate('participants');
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get conversations', error: error.message });
  }
};