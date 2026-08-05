const mongoose = require("mongoose");

const systemSettingSchema = mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: ["General", "Library Policy", "Security", "Notifications", "Other"],
      default: "Other"
    },
    description: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
