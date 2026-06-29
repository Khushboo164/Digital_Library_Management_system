const express = require("express");
const router = express.Router();

const {
  getMemberDashboard,
} = require("../controllers/membersController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.get(
  "/dashboard",
  protect,
  authorize("member"),
  getMemberDashboard
);

module.exports = router;