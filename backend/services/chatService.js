const Message = require('../models/Message');

const saveMessage = async ({ businessId, sender, text }) => {
  const message = await Message.create({ businessId, sender, text });
  return message;
};

const getRecentMessages = async (businessId, limit = 50) => {
  const messages = await Message.find({ businessId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return messages.reverse();
};

module.exports = { saveMessage, getRecentMessages };
