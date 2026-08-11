//model is actual object that connects to mongodb
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["member", "librarian", "admin"],
      default: "member",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedReason: {
      type: String,
      default: "",
    },

    blockedAt: {
      type: Date,
    },

    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    resignedAt: {
      type: Date,
      default: null,
    },

    isActiveEmployee: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    preferences: {
      darkMode: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true, //khudi bata dega ki last add or update kab kiya h
  }
);

module.exports = mongoose.model("User", userSchema);
//yeh ek user name ka model create karega using userSchema and model ko export karega