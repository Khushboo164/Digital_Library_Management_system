const User = require("../models/User");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const bcrypt = require("bcryptjs");
const SystemSetting = require("../models/SystemSetting");
const EmailHistory = require("../models/EmailHistory");
const AdminActivity = require("../models/AdminActivity");
const Reservation = require("../models/Reservation");
const LibrarianActivity = require("../models/LibrarianActivity");

const getDashboard = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalMembers = await User.countDocuments({ role: "member" });
        const totalLibrarians = await User.countDocuments({ role: "librarian" });
        const totalBooks = await Book.countDocuments();
        
        const books = await Book.find();
        let availableBooksCount = 0;
        books.forEach(b => { availableBooksCount += (b.availableCopies || 0); });
        
        const booksCurrentlyIssued = await Borrow.countDocuments({ returned: false, status: "Borrowed" });
        const activeReservations = await Reservation.countDocuments({ status: "Pending" });
        const booksLost = await Borrow.countDocuments({ isLost: true });
        const booksUnderReplacement = await Borrow.countDocuments({ replacementCost: { $gt: 0 }, replacementCostPaid: false });
        const awaitingReturnApproval = await Borrow.countDocuments({ status: "Return Requested" });
        const awaitingBorrowApproval = await Borrow.countDocuments({ status: "Borrow Requested" });
        
        const pendingBorrowRequests = awaitingBorrowApproval;
        const overdueBooks = await Borrow.countDocuments({ returned: false, status: "Borrowed", dueDate: { $lt: now }, finePaid: { $ne: true } });
        const blockedUsers = await User.countDocuments({ isBlocked: true });

        const collectionDistribution = await Book.aggregate([
            { $group: { _id: "$category", value: { $sum: 1 } } },
            { $project: { name: "$_id", value: 1, _id: 0 } },
            { $sort: { value: -1 } }
        ]);

        const PaymentTransaction = require("../models/PaymentTransaction");
        const successfulPayments = await PaymentTransaction.find({ status: "Success" });
        const refundedPayments = await PaymentTransaction.find({ status: "Refunded" });
        
        let todayCollection = 0;
        let monthCollection = 0;
        successfulPayments.forEach(p => {
             if (p.createdAt >= startOfToday) todayCollection += p.amount;
             if (p.createdAt >= startOfMonth) monthCollection += p.amount;
        });
        const totalRefundedAmount = refundedPayments.reduce((sum, p) => sum + p.amount, 0);

        const pendingFineRecords = await Borrow.find({ fine: { $gt: 0 }, finePaid: false });
        const pendingFine = pendingFineRecords.reduce((sum, b) => sum + (b.fine || 0), 0);
        
        const pendingRepRecords = await Borrow.find({ replacementCost: { $gt: 0 }, replacementCostPaid: false });
        const pendingReplacementCost = pendingRepRecords.reduce((sum, b) => sum + (b.replacementCost || 0), 0);

        const activeReservationsList = await Reservation.find({ status: "Pending" })
            .populate('user', 'name')
            .populate('book', 'title')
            .sort({ reservationDate: 1 })
            .limit(10);

        const recentEvents = await AdminActivity.find()
            .populate('admin', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        const topLibrarians = []; 
        const libsAgg = await LibrarianActivity.aggregate([
             { $group: { _id: "$librarian", count: { $sum: 1 } } },
             { $sort: { count: -1 } },
             { $limit: 3 }
        ]);
        let totalLibActions = 0;
        libsAgg.forEach(l => totalLibActions += l.count);
        for(let l of libsAgg) {
            const user = await User.findById(l._id).select('name profileImage');
            if(user) {
                topLibrarians.push({
                    user,
                    count: l.count,
                    percentage: totalLibActions > 0 ? Math.round((l.count / totalLibActions) * 100) : 0
                });
            }
        }

        const membersAgg = await Borrow.aggregate([
            { $group: { _id: "$user", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);
        let totalMemberBorrows = 0;
        membersAgg.forEach(m => totalMemberBorrows += m.count);
        const topMembers = [];
        for(let m of membersAgg) {
            const user = await User.findById(m._id).select('name profileImage');
            if(user) {
                topMembers.push({
                    user,
                    count: m.count,
                    percentage: totalMemberBorrows > 0 ? Math.round((m.count / totalMemberBorrows) * 100) : 0
                });
            }
        }

        const popBooksAgg = await Borrow.aggregate([
            { $group: { _id: "$book", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 4 }
        ]);
        const popularBooks = [];
        for(let p of popBooksAgg) {
            const book = await Book.findById(p._id).select('title coverImage');
            if(book) {
                popularBooks.push({
                    book,
                    borrowCount: p.count
                });
            }
        }

        res.status(200).json({
            overview: { totalMembers, totalBooks },
            totalMembers,
            totalLibrarians,
            totalBooks,
            health: {
                availableBooksCount,
                booksCurrentlyIssued,
                activeReservations,
                booksLost,
                booksUnderReplacement,
                awaitingReturnApproval,
                awaitingBorrowApproval
            },
            pendingBorrowRequests,
            overdueBooks,
            blockedUsers,
            insights: {
                collectionDistribution
            },
            finance: {
                todayCollection,
                monthCollection,
                pendingFine,
                pendingReplacementCost,
                totalRefundedAmount
            },
            activeReservationsList,
            recentEvents,
            topLibrarians,
            topMembers,
            popularBooks
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: error.message });
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

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllLibrarians = async (req, res) => {
    try {
        const librarians = await User.find({ role: "librarian" }).select("-password").sort({ createdAt: -1 });
        res.status(200).json(librarians);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createLibrarian = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const librarian = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "librarian",
            joiningDate: new Date(),
            isActiveEmployee: true
        });
        
        await AdminActivity.create({
            admin: req.user.id,
            action: "Created Librarian",
            targetUser: librarian._id,
            category: "Librarian Management",
            details: `Librarian account created for ${name}`
        });
        
        res.status(201).json({ message: "Librarian added successfully", librarian });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAdminActivities = async (req, res) => {
    try {
        const activities = await AdminActivity.find().populate("admin", "name").populate("targetUser", "name").populate("targetBook", "title").sort({ createdAt: -1 });
        res.status(200).json({ activities });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.find();
        if (settings.length === 0) {
            const defaults = [
                { key: "FINE_PER_DAY", value: "5", category: "Finance", description: "Fine amount charged per day for overdue books (₹)" },
                { key: "MAX_BORROW_DAYS", value: "14", category: "Library Rules", description: "Maximum days a member can borrow a book" },
                { key: "MAX_BOOKS_PER_MEMBER", value: "3", category: "Library Rules", description: "Maximum number of books a member can borrow simultaneously" },
                { key: "SYSTEM_EMAIL", value: "admin@booksphere.com", category: "System", description: "System email address for notifications" }
            ];
            await SystemSetting.insertMany(defaults);
            settings = await SystemSetting.find();
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSystemSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        if (!settings || !Array.isArray(settings)) return res.status(400).json({ message: "Invalid settings format" });
        
        for (const item of settings) {
            await SystemSetting.findOneAndUpdate(
                { key: item.key },
                { value: item.value, category: item.category, description: item.description },
                { upsert: true }
            );
        }
        
        await AdminActivity.create({
            admin: req.user.id,
            action: "Updated System Settings",
            category: "System Management",
            details: "System settings were modified"
        });
        
        res.status(200).json({ message: "Settings updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAdminEmailHistory = async (req, res) => {
    try {
        const history = await EmailHistory.find().populate("sentBy", "name").sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLostBooks = async (req, res) => {
    try {
        const lostBooks = await Borrow.find({ $or: [{ isLost: true }, { lostReported: true }] })
            .populate("user", "name email")
            .populate("book", "title coverImage")
            .sort({ updatedAt: -1 });
        res.status(200).json(lostBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllBooks = async (req, res) => {
    try {
        const { deleted } = req.query;
        let query = {};
        if (deleted === "true") {
            query.isDeleted = true;
        } else {
            query.isDeleted = false;
        }
        const books = await Book.find(query).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createBookAdmin = async (req, res) => {
    try {
        const book = await Book.create({
            ...req.body,
            addedBy: req.user.id,
        });
        await AdminActivity.create({
            admin: req.user.id,
            action: "Added New Book",
            targetBook: book._id,
            category: "Book Management",
            details: `Book "${book.title}" added to catalog`
        });
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBookAdmin = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!book) return res.status(404).json({ message: "Book not found" });
        await AdminActivity.create({
            admin: req.user.id,
            action: "Updated Book",
            targetBook: book._id,
            category: "Book Management",
            details: `Book "${book.title}" details updated`
        });
        res.status(200).json({ message: "Book updated successfully", book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBookAdmin = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        book.isDeleted = true;
        book.deletedBy = req.user.id;
        book.deletedDate = new Date();
        await book.save();
        await AdminActivity.create({
            admin: req.user.id,
            action: "Deleted Book",
            targetBook: book._id,
            category: "Book Management",
            details: `Book "${book.title}" marked as deleted`
        });
        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const restoreBookAdmin = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        book.isDeleted = false;
        book.deletedBy = null;
        book.deletedDate = null;
        await book.save();
        await AdminActivity.create({
            admin: req.user.id,
            action: "Restored Book",
            targetBook: book._id,
            category: "Book Management",
            details: `Book "${book.title}" restored to catalog`
        });
        res.status(200).json({ message: "Book restored successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};