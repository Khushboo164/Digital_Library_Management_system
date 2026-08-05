const mongoose = require("mongoose");
const dns = require("dns");

let isConnected = false;

// Set Google DNS for local environments to fix querySrv ECONNREFUSED issues on Windows
if (!process.env.VERCEL) {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (err) {
    console.warn("Could not set custom DNS:", err.message);
  }
}

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined.");
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;