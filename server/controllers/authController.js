const User = require("../models/User");//gets user model
const Otp = require("../models/Otp");
const { sendEmail } = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");//yeh library hai joh paswords ko hash code m convert krti h
const jwt = require("jsonwebtoken");

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    await sendEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully to your email!" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to send OTP" });
  }
};

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      secretCode,
      otp,
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (otp) {
      const validOtp = await Otp.findOne({ email, otp });
      if (!validOtp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      await Otp.deleteMany({ email });
    }

    let finalRole = "member";

    if (role === "librarian") {

      if (
        secretCode !== process.env.LIBRARIAN_CODE
      ) {
        return res.status(400).json({
          message: "Invalid Librarian Code",
        });
      }

      finalRole = "librarian";
    }

    if (role === "admin") {

      if (
        secretCode !== process.env.ADMIN_CODE
      ) {
        return res.status(400).json({
          message: "Invalid Admin Code",
        });
      }

      finalRole = "admin";
    }


    const salt = await bcrypt.genSalt(10); //salt ek random data h joh hashing k pehele added hota h - 10 number hai hashing rounds ka
    const hashedPassword = await bcrypt.hash(password, salt);


    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
    });

    res.status(201).json({ //201-http code created successfully
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ //500-internal server error k liye
      message: error.message,
    });
  }
};

// const loginUser = async (req, res) => {
//   res.json({
//     message: "Login Route Working",
//   });
// };

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  res.json({
    message: "Protected Route Accessed",
    user: req.user,
  });
};

const memberDashboard = (req, res) => {
  res.json({
    message: "Welcome to Member Dashboard",
  });
};

const librarianDashboard = (req, res) => {
  res.json({
    message: "Welcome to Librarian Dashboard",
  });
};

const adminDashboard = (req, res) => {
  res.json({
    message: "Welcome to Admin Dashboard",
  });
};

const blockUser = async (req, res) => {   // - userid should be added of user that has to be blcked http://localhost:5000/api/auth/block/6a3953270dfa170ee7c689c6 - with admin or librarian token
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isBlocked = true;
    user.blockedBy = req.user.id;
    user.blockedReason = "Pending dues";
    user.blockedAt = new Date();

    await user.save();

    res.status(200).json({
      message: "User blocked successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const unblockUser = async (req, res) => {  //http://localhost:5000/api/auth/unblock/6a3953270dfa170ee7c689c6
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isBlocked = false;
    user.blockedReason = "";
    user.blockedAt = null;

    await user.save();

    res.status(200).json({
      message: "User unblocked successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  sendOtp,
  registerUser,
  loginUser,
  getProfile,
  memberDashboard,
  librarianDashboard,
  adminDashboard,
  blockUser,
  unblockUser,
};