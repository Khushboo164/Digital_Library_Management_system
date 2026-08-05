const express = require("express");
const router = express.Router();

const {
  addBook,
  getBooks,
  getBookById,
  searchBooks,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getMyBorrows,
  calculateFine,
  markBookLost,
  payReplacementCost,
  payFine,
  getBooksPaginated,
  getBooksFiltered,
  getBooksSorted
} = require("../controllers/bookController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Admin / Librarian only
router.post("/", protect, authorize("admin", "librarian"), addBook);
router.put("/:id", protect, authorize("admin", "librarian"), updateBook);
router.delete("/:id", protect, authorize("admin", "librarian"), deleteBook);
router.put("/lost/:borrowId", protect, authorize("admin", "librarian"), markBookLost);
router.put("/pay-lost/:borrowId", protect, authorize("admin", "librarian"), payReplacementCost);

// Member / Admin / Librarian
router.post("/borrow", protect, authorize("member", "admin", "librarian"), borrowBook);
router.post("/return", protect, authorize("member", "admin", "librarian"), returnBook);
router.get("/my-borrows", protect, authorize("member", "admin", "librarian"), getMyBorrows);
router.get("/fine/:borrowId", protect, authorize("member", "admin", "librarian"), calculateFine);
router.put("/pay-fine/:borrowId", protect, authorize("member", "admin", "librarian"), payFine);

// Public / Member (Browser Catalog)
router.get("/", getBooks);
router.get("/search", searchBooks);
router.get("/pagination", getBooksPaginated);
router.get("/filter", getBooksFiltered);
router.get("/sort", getBooksSorted);

// Must be at the bottom to avoid catching /search, /pagination, etc.
router.get("/:id", getBookById);

module.exports = router;
