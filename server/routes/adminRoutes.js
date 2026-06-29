const express = require("express");
const router = express.Router();

const { 
  getDashboard, 
  resignLibrarian,
   getAllLibrarians,
   getLibrarianAnalytics,
   getMemberAnalytics,
   getBookAnalytics,
 } = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboard
);

router.put(
  "/librarian/:id/resign",
  protect,
  authorize("admin"),
  resignLibrarian
);

router.get(
  "/librarians",
  protect,
  authorize("admin"),
  getAllLibrarians
);

router.get(
  "/librarian/:id",
  protect,
  authorize("admin"),
  getLibrarianAnalytics
);

router.get(
  "/member/:id",
  protect,
  authorize("admin"),
  getMemberAnalytics
);

router.get(
  "/book/:id",
  protect,
  authorize("admin"),
  getBookAnalytics
);

module.exports = router;