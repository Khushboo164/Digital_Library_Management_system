const express = require("express");
const router = express.Router();

const { addBook,
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
        } = require("../controllers/bookController");
const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  authorize("admin", "librarian"),
  addBook
);

router.delete(
  "/:id",
  protect,
  authorize("admin", "librarian"),
  deleteBook
);

router.get("/", getBooks);
router.get("/search", searchBooks);
router.post(
  "/borrow",
  protect,
  authorize("member", "admin", "librarian"),
  borrowBook
);
router.post(
  "/return",
  protect,
  authorize("member", "admin", "librarian"),
  returnBook
);

router.get(
  "/my-borrows",
  protect,
  authorize("member", "admin", "librarian"),
  getMyBorrows
);

router.get(
  "/fine/:borrowId",
  protect,
  authorize("member", "admin", "librarian"),
  calculateFine
);

router.get("/:id", getBookById);

router.put(
  "/pay-fine/:borrowId",
  protect,
  authorize("member", "admin", "librarian"),
  payFine
);

router.put(
  "/:id",
  protect,
  authorize("admin", "librarian"),
  updateBook
);

router.put(
  "/lost/:borrowId",
  protect,
  authorize("admin", "librarian"),
  markBookLost
);

router.put(
  "/pay-lost/:borrowId",
  protect,
  authorize("admin", "librarian"),
  payReplacementCost
);

module.exports = router;