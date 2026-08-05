const mongoose = require("mongoose");

const emailHistorySchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  memberName: {
    type: String,
    required: false
  },
  memberEmail: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  senderRole: {
    type: String,
    default: "System"
  }
}, { timestamps: true });

module.exports = mongoose.model("EmailHistory", emailHistorySchema);
