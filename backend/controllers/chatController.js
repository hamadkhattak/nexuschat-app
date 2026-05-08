const chatService = require('../services/chatService');

const getMessages = async (req, res) => {
  try {
    const messages = await chatService.getRecentMessages(req.business._id);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMessages };
