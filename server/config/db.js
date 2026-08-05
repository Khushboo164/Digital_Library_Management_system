const mongoose = require("mongoose");
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']); // yeh google ka dns server hai, instead system ka default dns

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;