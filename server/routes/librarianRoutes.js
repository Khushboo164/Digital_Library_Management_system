const express = require("express");
const router = express.Router();

const {
  getAllBorrows,
  getReservations,
  notifyReservation,
  skipReservation,
  cancelReservation,
  markReservationBorrowed,
  getOverdueMembers,
  getInventoryHealth,
  getLibrarianActivities,
  getLibrarianAnalytics,
  getLibrarianNotifications,
  markNotificationRead,
  deleteNotification,
  getLibrarianPayments,
  approvePayment,
  getLibrarianDashboard,
  getMyPerformance,
  getMemberAnalytics,
  getBorrowRequests,
  approveBorrowRequest,
  rejectBorrowRequest,
  issueBook,
  getReturnRequests,
  approveReturnRequest,
  rejectReturnRequest,
  receiveBook,
  getLibrarianBooks,
  createBookLibrarian,
  getLibrarianEmailHistory,
  getLostBooksLibrarian,
  updateLostBookStatusLibrarian,
  getAllMembers,
  sendMemberEmailLibrarian,
  updateLibrarianProfile,
  updateBookLibrarian,
  deleteBookLibrarian,
  restoreBookLibrarian
} = require("../controllers/librarianController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.get("/dashboard", protect, authorize("librarian"), getLibrarianDashboard);
router.get("/my-performance", protect, authorize("librarian"), getMyPerformance);
router.get("/member/:memberId", protect, authorize("librarian"), getMemberAnalytics);

router.get("/borrows", protect, authorize("librarian", "admin"), getAllBorrows);

router.get("/reservations", protect, authorize("librarian", "admin"), getReservations);
router.put("/reservations/:id/notify", protect, authorize("librarian", "admin"), notifyReservation);
router.put("/reservations/:id/skip", protect, authorize("librarian", "admin"), skipReservation);
router.put("/reservations/:id/cancel", protect, authorize("librarian", "admin"), cancelReservation);
router.put("/reservations/:id/borrow", protect, authorize("librarian", "admin"), markReservationBorrowed);

router.get("/overdue", protect, authorize("librarian", "admin"), getOverdueMembers);
router.get("/inventory-health", protect, authorize("librarian", "admin"), getInventoryHealth);
router.get("/activities", protect, authorize("librarian", "admin"), getLibrarianActivities);
router.get("/analytics", protect, authorize("librarian", "admin"), getLibrarianAnalytics);

router.get("/notifications", protect, authorize("librarian", "admin"), getLibrarianNotifications);
router.put("/notifications/:id/read", protect, authorize("librarian", "admin"), markNotificationRead);
router.delete("/notifications/:id", protect, authorize("librarian", "admin"), deleteNotification);

router.get("/payments", protect, authorize("librarian", "admin"), getLibrarianPayments);
router.put("/payments/approve", protect, authorize("librarian", "admin"), approvePayment);

// Missing Librarian Endpoints
router.get("/requests/borrow", protect, authorize("librarian"), getBorrowRequests);
router.put("/requests/borrow/:id/approve", protect, authorize("librarian"), approveBorrowRequest);
router.put("/requests/borrow/:id/reject", protect, authorize("librarian"), rejectBorrowRequest);
router.put("/requests/borrow/:id/issue", protect, authorize("librarian"), issueBook);

router.get("/requests/return", protect, authorize("librarian"), getReturnRequests);
router.put("/requests/return/:id/approve", protect, authorize("librarian"), approveReturnRequest);
router.put("/requests/return/:id/reject", protect, authorize("librarian"), rejectReturnRequest);
router.put("/requests/return/:id/receive", protect, authorize("librarian"), receiveBook);

router.get("/books", protect, authorize("librarian"), getLibrarianBooks);
router.post("/books", protect, authorize("librarian"), createBookLibrarian);
router.put("/books/:id", protect, authorize("librarian"), updateBookLibrarian);
router.delete("/books/:id", protect, authorize("librarian"), deleteBookLibrarian);
router.put("/books/:id/restore", protect, authorize("librarian"), restoreBookLibrarian);

router.get("/email-history", protect, authorize("librarian"), getLibrarianEmailHistory);
router.get("/lost-books", protect, authorize("librarian"), getLostBooksLibrarian);
router.put("/lost-books/:id/status", protect, authorize("librarian"), updateLostBookStatusLibrarian);

router.get("/members", protect, authorize("librarian"), getAllMembers);
router.post("/member/email", protect, authorize("librarian", "admin"), sendMemberEmailLibrarian);
router.put("/profile", protect, authorize("librarian", "admin"), updateLibrarianProfile);

module.exports = router;