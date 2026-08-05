const mongoose = require("mongoose");

const adminActivitySchema = mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    targetBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
    category: {
      type: String,
      enum: ["User Management", "Librarian Management", "Member Management", "Book Management", "Finance", "System Management", "Security", "Other"],
      default: "Other"
    },
    status: {
      type: String,
      enum: ["Successful", "Failed", "Pending"],
      default: "Successful"
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AdminActivity", adminActivitySchema);
