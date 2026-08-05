const mongoose = require("mongoose");

const wishlistSchema = mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only wishlist a book once
wishlistSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
