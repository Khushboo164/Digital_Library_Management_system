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
    },
    dueDate: {
      type: Date,
    },
    returned: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Borrow Requested", "Borrow Approved", "Borrow Rejected", "Borrowed", "Return Requested", "Return Approved", "Return Rejected", "Returned", "Lost"],
      default: "Borrow Requested",
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: { type: Date },
    issueDate: { type: Date },
    returnRequestDate: { type: Date },
    returnApprovalDate: { type: Date },
    returnReceiveDate: { type: Date },
    rejectionReason: { type: String },
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

    isFound: {
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
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    returnApprovedBy: {
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

    renewalCount: {
      type: Number,
      default: 0,
    },

    lostReported: {
      type: Boolean,
      default: false,
    },
    lostReportedDate: {
      type: Date,
    },

    lostRequestStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Borrow", borrowSchema);