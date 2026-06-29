const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const User = require("../models/User");

const addBook = async (req, res) => {  //book add krne k liye  // Api- http://localhost:5000/api/books - with jwt of librarian or member
  try {
    const book = await Book.create({
      ...req.body,
      addedBy: req.user.id,
    });

    res.status(201).json({
      message: "Book added successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBooks = async (req, res) => {  //saare books k liye APi - http://localhost:5000/api/books
  try {
    const books = await Book.find({
      isDeleted: false,
    });

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBookById = async (req, res) => {  //book id se access krne k liye  API - http://localhost:5000/api/books/6a421bbb2b6d17e868773508
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const searchBooks = async (req, res) => {  //book search krne k liye API - http://localhost:5000/api/books/search?keyword=ends
  try {
    const keyword = req.query.keyword;

    const books = await Book.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { author: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { isbn: { $regex: keyword, $options: "i" } }
      ]
    });

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updateBook = async (req, res) => {  //changes update krne k liye
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteBook = async (req, res) => {  //book delete krne k liye API - http://localhost:5000/api/books/6a3d52e0f4ad70126b43468a
  try {

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    book.isDeleted = true;
    book.deletedBy = req.user.id;
    book.deletedDate = new Date();

    await book.save();

    res.status(200).json({
      message: "Book deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const borrowBook = async (req, res) => {  //book borrow krne k liye  Api - http://localhost:5000/api/books/borrow ,with book id in bosy and mamber token in header
  try {

    const { bookId } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account is blocked. Contact library staff."
      });
    }

    const unpaidFine = await Borrow.findOne({
      user: req.user.id,
      fine: { $gt: 0 },
      finePaid: false,
    });

    if (unpaidFine) {
      return res.status(403).json({
        message:
          "Please pay your pending fine before borrowing new books.",
      });
    }

    const unpaidReplacement = await Borrow.findOne({
      user: req.user.id,
      isLost: true,
      replacementCost: { $gt: 0 },
      replacementCostPaid: false,
    });

    if (unpaidReplacement) {
      return res.status(403).json({
        message:
          "Please clear your lost book payment before borrowing new books.",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        message: "No copies available",
      });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10);
    const borrow = await Borrow.create({
      user: req.user.id,
      book: bookId,
      dueDate,
      issuedBy: req.user.id,
    });

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({
      message: "Book borrowed successfully",
      borrow,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const returnBook = async (req, res) => {  //book return krne k liye Api - http://localhost:5000/api/books/return , with book if in body and token in header of member
  try {
    const { borrowId } = req.body;

    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res.status(404).json({
        message: "Borrow record not found",
      });
    }

    if (borrow.returned) {
      return res.status(400).json({
        message: "Book already returned",
      });
    }

    const book = await Book.findById(borrow.book);

    borrow.returned = true;
    borrow.returnedHandledBy = req.user.id;
    await borrow.save();

    book.availableCopies += 1;
    await book.save();

    res.status(200).json({
      message: "Book returned successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyBorrows = async (req, res) => {  //logged in user ki borrow history k liye  APi - http://localhost:5000/api/books/my-borrows , with member token in header
  try {
    const borrows = await Borrow.find({
      user: req.user.id,
    })
      .populate("book", "title author category")
      .sort({ createdAt: -1 });

    res.status(200).json(borrows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//fine calculation
const calculateFine = async (req, res) => {  //fine calculation k liye Api - http://localhost:5000/api/books/fine/6a3a93d3526543b460924bec , with member token in header
  try {
    const { borrowId } = req.params;

    const borrow = await Borrow.findById(borrowId)
      .populate("book", "title");

    if (!borrow) {
      return res.status(404).json({
        message: "Borrow record not found",
      });
    }

    const today = new Date();
    const dueDate = new Date(borrow.dueDate);

    let fine = 0;

    if (today > dueDate && !borrow.returned) {
      const daysLate = Math.ceil(
        (today - dueDate) / (1000 * 60 * 60 * 24)
      );

      fine = daysLate * 5;
    }

    borrow.fine = fine;
    await borrow.save();

    res.status(200).json({
      book: borrow.book.title,
      dueDate: borrow.dueDate,
      fine,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const payFine = async (req, res) => {  //fine pay krne k liye API - http://localhost:5000/api/books/pay-fine/6a3a93d3526543b460924bec , with member token in haeder
  try {
    const { borrowId } = req.params;

    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res.status(404).json({
        message: "Borrow record not found",
      });
    }

    if (borrow.fine <= 0) {
      return res.status(400).json({
        message: "No fine pending",
      });
    }

    if (borrow.finePaid) {
      return res.status(400).json({
        message: "Fine already paid",
      });
    }

    borrow.finePaid = true;
    borrow.fineCollectedBy = req.user.id;
    borrow.finePaidDate = new Date();

    await borrow.save();

    res.status(200).json({
      message: "Fine paid successfully",
      amountPaid: borrow.fine,
      paidAt: borrow.finePaidDate,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const markBookLost = async (req, res) => {  //book lost mark krne k liye API - http://localhost:5000/api/books/lost/6a3a93d3526543b460924bec ,
  try {
    const { borrowId } = req.params;

    const borrow = await Borrow.findById(borrowId)
      .populate("book");

    if (!borrow) {
      return res.status(404).json({
        message: "Borrow record not found",
      });
    }

    borrow.isLost = true;

    // Use book price as replacement cost
    borrow.replacementCost = borrow.book.price || 500;

    await borrow.save();

    res.status(200).json({
      message: "Book marked as lost",
      replacementCost: borrow.replacementCost,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const payReplacementCost = async (req, res) => {  //replacement cost pay krne k liye API - http://localhost:5000/api/books/pay-lost/6a3a93d3526543b460924bec , with member token in header
  try {
    const { borrowId } = req.params;

    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res.status(404).json({
        message: "Borrow record not found",
      });
    }

    if (!borrow.isLost) {
      return res.status(400).json({
        message: "This book is not marked as lost",
      });
    }

    if (borrow.replacementCostPaid) {
      return res.status(400).json({
        message: "Replacement cost already paid",
      });
    }

    borrow.replacementCostPaid = true;
    borrow.replacementCollectedBy = req.user.id;
    borrow.replacementCostPaidDate = new Date();

    await borrow.save();

    res.status(200).json({
      message: "Replacement cost paid successfully",
      amount: borrow.replacementCost,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
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
};