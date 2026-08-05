const mongoose = require("mongoose");

const paymentTransactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrowRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Borrow",
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["Fine", "Replacement", "Other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      default: "Pending",
    },
    transactionId: {
      type: String,
      unique: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
