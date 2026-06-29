const User = require("../models/User");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");

const getDashboard = async (req, res) => {  //http://localhost:5000/api/admin/dashboard
    try {

        const totalMembers = await User.countDocuments({
            role: "member",
        });

        const totalLibrarians = await User.countDocuments({
            role: "librarian",
        });

        const totalAdmins = await User.countDocuments({
            role: "admin",
        });

        const totalBooks = await Book.countDocuments();

        const totalBooksBorrowed = await Borrow.countDocuments();

        const totalBooksReturned = await Borrow.countDocuments({
            returned: true,
        });

        const totalBooksDeleted = await Book.countDocuments({
            isDeleted: true,
        });
        const blockedUsers = await User.countDocuments({
            isBlocked: true,
        });

        const overdueBooks = await Borrow.countDocuments({
            returned: false,
            dueDate: { $lt: new Date() },
        });

        const lostBooks = await Borrow.countDocuments({
            isLost: true,
        });

        const paidFines = await Borrow.find({
            finePaid: true,
        });

        const totalFineCollected = paidFines.reduce(
            (total, borrow) => total + borrow.fine,
            0
        );

        const pendingFineRecords =
            await Borrow.find({
                fine: { $gt: 0 },
                finePaid: false,
            });

        const pendingFine =
            pendingFineRecords.reduce(
                (total, borrow) =>
                    total + (borrow.fine || 0),
                0
            );

        const paidReplacements = await Borrow.find({
            replacementCostPaid: true,
        });

        const totalReplacementCollected =
            paidReplacements.reduce(
                (total, borrow) =>
                    total +
                    (borrow.replacementCost || 0),
                0
            );

        const pendingReplacementRecords =
            await Borrow.find({
                replacementCost: { $gt: 0 },
                replacementCostPaid: false,
            });

        const pendingReplacementCost =
            pendingReplacementRecords.reduce(
                (total, borrow) =>
                    total +
                    (borrow.replacementCost || 0),
                0
            );

        res.status(200).json({
            totalMembers,
            totalLibrarians,
            totalAdmins,
            totalBooks,
            totalBooksBorrowed,
            totalBooksReturned,
            totalBooksDeleted,
            blockedUsers,
            overdueBooks,
            lostBooks,
            totalFineCollected,
            pendingFine,
            totalReplacementCollected,
            pendingReplacementCost,

        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getAllLibrarians = async (req, res) => {
    try {

        const librarians = await User.find({
            role: "librarian"
        }).select("-password");

        res.status(200).json(librarians);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const resignLibrarian = async (req, res) => {
    try {

        const librarian = await User.findById(
            req.params.id
        );

        if (!librarian) {
            return res.status(404).json({
                message: "Librarian not found",
            });
        }

        librarian.isActiveEmployee = false;
        librarian.resignedAt = new Date();

        await librarian.save();

        res.status(200).json({
            message: "Librarian resigned successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


const getLibrarianAnalytics = async (req, res) => {
    try {
        const librarianId = req.params.id;

        const librarian = await User.findById(librarianId)
            .select("-password");

        if (!librarian) {
            return res.status(404).json({
                message: "Librarian not found",
            });
        }

        const booksAdded = await Book.find({
            addedBy: librarianId,
        });

        const booksDeleted = await Book.find({
            deletedBy: librarianId,
        });

        const blockedMembers = await User.find({
            blockedBy: librarianId,
        }).select("-password");

        const fineRecords = await Borrow.find({
            fineCollectedBy: librarianId,
            finePaid: true,
        })
            .populate("user", "name email")
            .populate("book", "title");

        const replacementRecords = await Borrow.find({
            replacementCollectedBy: librarianId,
            replacementCostPaid: true,
        })
            .populate("user", "name email")
            .populate("book", "title");

        const totalFineCollected = fineRecords.reduce(
            (sum, record) => sum + (record.fine || 0),
            0
        );

        const totalReplacementCollected =
            replacementRecords.reduce(
                (sum, record) =>
                    sum + (record.replacementCost || 0),
                0
            );

        res.status(200).json({
            librarian: {
                id: librarian._id,
                name: librarian.name,
                email: librarian.email,
                joiningDate: librarian.joiningDate,
                resignedAt: librarian.resignedAt,
                isActiveEmployee:
                    librarian.isActiveEmployee,
            },

            summary: {
                booksAdded: booksAdded.length,
                booksDeleted: booksDeleted.length,
                blockedMembers:
                    blockedMembers.length,
                totalFineCollected,
                totalReplacementCollected,
            },

            booksAdded,

            booksDeleted,

            blockedMembers,

            fineRecords,

            replacementRecords,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getMemberAnalytics = async (req, res) => {
  try {

    const memberId = req.params.id;

    const member = await User.findById(memberId)
      .select("-password");

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    const borrowHistory = await Borrow.find({
  user: memberId,
})
.populate("book", "title author")
.populate("fineCollectedBy", "name email")
.populate(
  "replacementCollectedBy",
  "name email"
);

    const currentBooks = borrowHistory.filter(
      (record) =>
        !record.returned && !record.isLost
    );

    const returnedBooks = borrowHistory.filter(
      (record) => record.returned
    );

    const lostBooks = borrowHistory.filter(
      (record) => record.isLost
    );

    const fineHistory = borrowHistory.filter(
      (record) =>
        record.fine > 0
    );

    const totalFinePaid = borrowHistory
      .filter((record) => record.finePaid)
      .reduce(
        (sum, record) =>
          sum + (record.fine || 0),
        0
      );

    const totalReplacementPaid =
      borrowHistory
        .filter(
          (record) =>
            record.replacementCostPaid
        )
        .reduce(
          (sum, record) =>
            sum +
            (record.replacementCost || 0),
          0
        );

    res.status(200).json({
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,

        isBlocked: member.isBlocked,
        blockedAt: member.blockedAt,
        blockedReason:
          member.blockedReason,

        joiningDate:
          member.createdAt,
      },

      statistics: {
        totalBooksBorrowed:
          borrowHistory.length,

        totalBooksReturned:
          returnedBooks.length,

        currentBooks:
          currentBooks.length,

        lostBooks:
          lostBooks.length,

        totalFinePaid,

        totalReplacementPaid,
      },

      currentBooks,

      returnedBooks,

      fineHistory,

      lostBooks,

      borrowHistory,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBookAnalytics = async (req, res) => {
  try {

    const bookId = req.params.id;

    const book = await Book.findById(bookId)
      .populate("addedBy", "name email")
      .populate("deletedBy", "name email");

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const borrowHistory = await Borrow.find({
      book: bookId,
    })
      .populate("user", "name email")
      .populate("fineCollectedBy", "name email")
      .populate(
        "replacementCollectedBy",
        "name email"
      );

    const returnedBooks = borrowHistory.filter(
      (record) => record.returned
    );

    const lostBooks = borrowHistory.filter(
      (record) => record.isLost
    );

    const fineRecords = borrowHistory.filter(
      (record) => record.fine > 0
    );

    const replacementRecords =
      borrowHistory.filter(
        (record) =>
          record.replacementCost > 0
      );

    const totalFineGenerated =
      borrowHistory.reduce(
        (sum, record) =>
          sum + (record.fine || 0),
        0
      );

    const totalFineCollected =
      borrowHistory
        .filter(
          (record) => record.finePaid
        )
        .reduce(
          (sum, record) =>
            sum + (record.fine || 0),
          0
        );

    const totalReplacementGenerated =
      borrowHistory.reduce(
        (sum, record) =>
          sum +
          (record.replacementCost || 0),
        0
      );

    const totalReplacementCollected =
      borrowHistory
        .filter(
          (record) =>
            record.replacementCostPaid
        )
        .reduce(
          (sum, record) =>
            sum +
            (record.replacementCost || 0),
          0
        );

    res.status(200).json({

      book,

      statistics: {
        totalBorrows:
          borrowHistory.length,

        totalReturns:
          returnedBooks.length,

        totalLost:
          lostBooks.length,

        totalFineGenerated,

        totalFineCollected,

        totalReplacementGenerated,

        totalReplacementCollected,
      },

      borrowHistory,

      returnedBooks,

      lostBooks,

      fineRecords,

      replacementRecords,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
    getDashboard,
    resignLibrarian,
    getAllLibrarians,
    getLibrarianAnalytics,
    getMemberAnalytics,
    getBookAnalytics,
};