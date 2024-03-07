const Message = require('../models/message');

exports.sendMessage = async (req, res) => {
  try {
    const { content, conversationId, } = req.body;
    const message = new Message({
      content,
      sender: req.user.id,
      conversation: conversationId
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId }).populate('sender');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get messages', error: error.message });
  }
};
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await messageService.getAllMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).send(error.message);
  }
};