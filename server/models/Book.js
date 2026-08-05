const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    publisher: {
      type: String,
      default: "",
    },
    publishedYear: {
      type: Number,
    },
    language: {
      type: String,
      default: "English",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    totalCopies: {
      type: Number,
      default: 1,
    },
    availableCopies: {
      type: Number,
      default: 1,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    deletedDate: {
      type: Date,
    },

    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    editedDate: {
      type: Date,
    },

    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    restoredDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Book || mongoose.model("Book", bookSchema);