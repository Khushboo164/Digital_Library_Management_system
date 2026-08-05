const mongoose = require("mongoose");

const librarianActivitySchema = mongoose.Schema(
  {
    librarian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LibrarianActivity", librarianActivitySchema);
