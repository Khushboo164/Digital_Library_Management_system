const mongoose = require("mongoose");

const librarianNotificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["New Borrow Request", "Return Request", "Lost Book Report", "Reservation Ready", "Payment Received", "System"],
      default: "System",
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LibrarianNotification", librarianNotificationSchema);
