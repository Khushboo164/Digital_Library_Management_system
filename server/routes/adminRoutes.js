const express = require("express");
const router = express.Router();

const { 
  getDashboard, 
  resignLibrarian,
   getAllLibrarians,
   getLibrarianAnalytics,
   getMemberAnalytics,
   getBookAnalytics,
   getAllUsers,
   createLibrarian,
   getAdminActivities,
   getSystemSettings,
   updateSystemSettings,
   getAdminEmailHistory,
   getLostBooks,
   getAllBooks,
   createBookAdmin,
   updateBookAdmin,
   deleteBookAdmin,
   restoreBookAdmin
 } = require("../controllers/adminController");
 
 const { getOverdueMembers, sendMemberEmailLibrarian } = require("../controllers/librarianController");

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

router.get("/users", protect, authorize("admin"), getAllUsers);
router.post("/librarian", protect, authorize("admin"), createLibrarian);
router.get("/activities", protect, authorize("admin"), getAdminActivities);
router.get("/settings", protect, authorize("admin"), getSystemSettings);
router.put("/settings", protect, authorize("admin"), updateSystemSettings);
router.get("/email-history", protect, authorize("admin"), getAdminEmailHistory);
router.get("/lost-books", protect, authorize("admin"), getLostBooks);

router.get("/overdue", protect, authorize("admin"), getOverdueMembers);
router.post("/member/email", protect, authorize("admin"), sendMemberEmailLibrarian);

// Book endpoints
router.get("/books", protect, authorize("admin"), getAllBooks);
router.post("/books", protect, authorize("admin"), createBookAdmin);
router.put("/books/:id", protect, authorize("admin"), updateBookAdmin);
router.delete("/books/:id", protect, authorize("admin"), deleteBookAdmin);
router.put("/books/:id/restore", protect, authorize("admin"), restoreBookAdmin);

module.exports = router;