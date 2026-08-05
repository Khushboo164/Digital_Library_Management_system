require("dotenv").config(); //.env mese pura data load krne k liye

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); //db.js ka connectdb function
const authRoutes = require("./routes/authRoutes"); //authRoutes file
const bookRoutes = require("./routes/bookRoutes");
const adminRoutes = require("./routes/adminRoutes");
const memberRoutes = require("./routes/memberRoutes");
const librarianRoutes = require("./routes/librarianRoutes");

const app = express(); //express application/server create krne k liye

app.use(cors()); // Allow cross-origin requests from the frontend
connectDB();//yaha hume db.js k connectdb function ko call kiya hai

// Removed importBooks script from startup

app.use(express.json()); // ek middleware joh frontend se aaye hue data ko json k form m conert kare

app.use("/api/auth", authRoutes); //yeh or authRoutes wali api ko combine krke finalapi banaega
app.use("/api/books", bookRoutes);

app.get("/", (req, res) => {
  res.send("BookSphere API Running");
});

app.use("/api/admin", adminRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/librarian", librarianRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});