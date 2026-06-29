const express = require("express");
const router = express.Router();

const {
  getLibrarianDashboard,
  getMyPerformance,
  getMemberAnalytics,
} = require("../controllers/librarianController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.get(
  "/dashboard",
  protect,
  authorize("librarian"),
  getLibrarianDashboard
);

router.get(
  "/my-performance",
  protect,
  authorize("librarian"),
  getMyPerformance
);

router.get(
  "/member/:memberId",
  protect,
  authorize("librarian"),
  getMemberAnalytics
);

module.exports = router;