const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProcessedMessageSchema = new Schema({
  messageId: { type: String, required: true, unique: true },
  uid: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// ensure index (creates at startup if not exists)
ProcessedMessageSchema.index({ messageId: 1 }, { unique: true });

module.exports = mongoose.model('ProcessedMessage', ProcessedMessageSchema);
