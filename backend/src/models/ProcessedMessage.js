const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProcessedMessageSchema = new Schema({
  messageId: {
    type: String,
    required: true,
  },

  uid: {
    type: Number,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ProcessedMessageSchema.index(
  { messageId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ProcessedMessage",
  ProcessedMessageSchema
);