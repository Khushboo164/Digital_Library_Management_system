const mongoose = require("mongoose");//mongoose package import krne k liye
//mongoose help krta h mongodb or server ko conncet krne m
const connectDB = async () => {
  try {
    // const conn = await mongoose.connect(process.env.MONGODB_URI);

    // console.log(`MongoDB Connected: ${conn.connection.host}`);
    const conn = await mongoose.connect(process.env.MONGODB_URI);

   console.log("Host:", conn.connection.host);
   console.log("Database:", conn.connection.name);
  } catch (error) {
    console.error("Database Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;