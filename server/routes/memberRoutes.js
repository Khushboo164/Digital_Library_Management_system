const express = require("express");
const router = express.Router();

const {
  getMemberDashboard,
  getMemberProfile,
  updateMemberProfile,
  getCurrentBorrowedBooks,
  getBorrowHistory,
  getFineHistory,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  reserveBook,
  cancelReservation,
  getMyReservations,
  renewBook,
  getRenewHistory,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getRecommendedBooks,
  getReadingStatistics,
  rateBook,
  updateRating,
  getMyRatings,
  deleteRating,
  requestLostBook,
  cancelLostBookRequest,
  returnFoundLostBook,
  getLostBookRequests,
  createFinePayment,
  verifyFinePayment,
  getFinePaymentHistory,
  createReplacementPayment,
  verifyReplacementPayment,
  getReplacementPaymentHistory,
  getMemberEmails
} = require("../controllers/membersController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Dashboard
router.get("/dashboard", protect, authorize("member"), getMemberDashboard);

// Profile
router.get("/profile", protect, authorize("member"), getMemberProfile);
router.put("/profile", protect, authorize("member"), updateMemberProfile);

// Emails
router.get("/emails", protect, authorize("member"), getMemberEmails);

// Borrowing & History
router.get("/borrowed-books", protect, authorize("member"), getCurrentBorrowedBooks);
router.get("/borrow-history", protect, authorize("member"), getBorrowHistory);
router.get("/fine-history", protect, authorize("member"), getFineHistory);

// Wishlist
router.get("/wishlist", protect, authorize("member"), getWishlist);
router.post("/wishlist", protect, authorize("member"), addToWishlist);
router.delete("/wishlist/:id", protect, authorize("member"), removeFromWishlist);

// Reservations
router.get("/reservations", protect, authorize("member"), getMyReservations);
router.post("/reservations", protect, authorize("member"), reserveBook);
router.delete("/reservations/:id", protect, authorize("member"), cancelReservation);

// Renewals
router.post("/renew/:id", protect, authorize("member"), renewBook);
router.get("/renewals/history", protect, authorize("member"), getRenewHistory);

// Notifications
router.get("/notifications", protect, authorize("member"), getNotifications);
router.put("/notifications/:id/read", protect, authorize("member"), markNotificationRead);
router.put("/notifications/read-all", protect, authorize("member"), markAllNotificationsRead);

// Recommendations & Stats
router.get("/recommendations", protect, authorize("member"), getRecommendedBooks);
router.get("/reading-statistics", protect, authorize("member"), getReadingStatistics);

// Ratings - Frontend calls /member/ratings
router.get("/ratings", protect, authorize("member"), getMyRatings);
router.post("/ratings", protect, authorize("member"), rateBook);
router.put("/ratings/:id", protect, authorize("member"), updateRating);
router.delete("/ratings/:id", protect, authorize("member"), deleteRating);
// Legacy routes kept for compatibility
router.post("/rate/:bookId", protect, authorize("member"), rateBook);
router.put("/rate/:bookId", protect, authorize("member"), updateRating);

// Lost Book - Frontend calls /member/lost-book
router.get("/lost-book", protect, authorize("member"), getLostBookRequests);
router.post("/lost-book", protect, authorize("member"), requestLostBook);
router.put("/lost-book/:id/return", protect, authorize("member"), returnFoundLostBook);
router.delete("/lost-book/:id", protect, authorize("member"), cancelLostBookRequest);

// Payments - Fine
router.post("/payments/fine", protect, authorize("member"), createFinePayment);
router.post("/payments/fine/create", protect, authorize("member"), createFinePayment);
router.post("/payments/fine/verify", protect, authorize("member"), verifyFinePayment);
router.get("/payments/fine/history", protect, authorize("member"), getFinePaymentHistory);

// Payments - Replacement
router.post("/payments/replacement", protect, authorize("member"), createReplacementPayment);
router.post("/payments/replacement/create", protect, authorize("member"), createReplacementPayment);
router.post("/payments/replacement/verify", protect, authorize("member"), verifyReplacementPayment);
router.get("/payments/replacement/history", protect, authorize("member"), getReplacementPaymentHistory);

module.exports = router;
