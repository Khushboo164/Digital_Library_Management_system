const express = require("express"); //isiliye kyuki iske bina hum expresss.router() k functions use nhi krr paate is file m

const {
  registerUser,
  loginUser,
  getProfile,
  memberDashboard,
  librarianDashboard,
  adminDashboard,
  blockUser,
  unblockUser,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

router.get(
  "/member-dashboard",
  protect,
  authorize("member"),
  memberDashboard
);

router.get(
  "/librarian-dashboard",
  protect,
  authorize("librarian"),
  librarianDashboard
);

router.get(
  "/admin-dashboard",
  protect,
  authorize("admin"),
  adminDashboard
);

router.put(
  "/block/:userId",
  protect,
  authorize("admin" , "librarian"),
  blockUser
);

router.put(
  "/unblock/:userId",
  protect,
  authorize("admin", "librarian"),
  unblockUser
);

module.exports = router;