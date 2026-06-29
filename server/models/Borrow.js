const mongoose = require("mongoose");

const borrowSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returned: {
      type: Boolean,
      default: false,
    },
    fine: {
      type: Number,
      default: 0,
    },

    finePaid: {
      type: Boolean,
      default: false,
    },

    finePaidDate: {
      type: Date,
    },


    isLost: {
      type: Boolean,
      default: false,
    },

    replacementCost: {
      type: Number,
      default: 0,
    },

    replacementCostPaid: {
      type: Boolean,
      default: false,
    },

    replacementCostPaidDate: {
      type: Date,
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    returnedHandledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    fineCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    replacementCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },


  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Borrow", borrowSchema);