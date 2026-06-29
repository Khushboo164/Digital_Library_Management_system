const User = require("../models/User");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");

const getLibrarianDashboard = async (req, res) => {  //http://localhost:5000/api/librarian/dashboard 
  try {

    const totalMembers = await User.countDocuments({
      role: "member", //returns total members
    });

    const totalBooksEntered = await Book.countDocuments(); //total books entered

    const totalBooksDeleted = await Book.countDocuments({
      isDeleted: true,  //total books deleted
    });

    const totalBooksWithdrawn = await Borrow.countDocuments(); //total books withdrawn

    const totalBooksReturned = await Borrow.countDocuments({ //total books returned
      returned: true,
    });

    const blockedMembers = await User.countDocuments({
      isBlocked: true, //total blocked members
    });

    const fineRecords = await Borrow.find({
      finePaid: true, //fine status
    });

    const totalFineCollected = fineRecords.reduce(
      (sum, borrow) => sum + (borrow.fine || 0),
      0
    ); //total fine collected 

    const replacementRecords = await Borrow.find({
      replacementCostPaid: true,
    }); //replacement status

    const totalReplacementCostCollected =
      replacementRecords.reduce(
        (sum, borrow) =>
          sum + (borrow.replacementCost || 0),
        0
      );//replacement cost recieved

    const pendingFineRecords = await Borrow.find({
      finePaid: false,
    }); //pending fine recordes

    const pendingFine = pendingFineRecords.reduce(
      (sum, borrow) => sum + (borrow.fine || 0),
      0
    ); //pending fine 

    const pendingReplacementRecords =
      await Borrow.find({
        replacementCostPaid: false,
      });

    const pendingReplacementCost =
      pendingReplacementRecords.reduce(
        (sum, borrow) =>
          sum + (borrow.replacementCost || 0),
        0
      ); //pending replacement cost

    res.status(200).json({
      totalMembers,
      totalBooksEntered,
      totalBooksDeleted,
      totalBooksWithdrawn,
      totalBooksReturned,

      totalFineCollected,
      totalReplacementCostCollected,

      pendingFine,
      pendingReplacementCost,

      blockedMembers,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const getMyPerformance = async (req, res) => {  //http://localhost:5000/api/librarian/my-performance
  try {
    const librarianId = req.user.id;  //id of librarian 

    // Books Added By Me
    const booksAdded = await Book.find({
      addedBy: librarianId,
    }); //total books added

    // Books Deleted By Me
    const booksDeleted = await Book.find({
      deletedBy: librarianId,
    }); //total books deleted

    // Members Blocked By Me
    const blockedMembers = await User.find({
      blockedBy: librarianId,
    }); //books deleted

    // Fine Records
    const fineRecords = await Borrow.find({
      fineCollectedBy: librarianId,
      finePaid: true,
    }) //fine collected
      .populate("user", "name email")
      .populate("book", "title");

    // Replacement Records
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
      summary: {
        totalBooksAdded: booksAdded.length,
        totalBooksDeleted: booksDeleted.length,
        totalMembersBlocked: blockedMembers.length,
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

    const member = await User.findById(req.params.memberId)
      .select("-password");

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    const borrows = await Borrow.find({
      user: member._id,
    }).populate("book");

    const totalBooksBorrowed = borrows.length;

    const totalBooksReturned = borrows.filter(
      (b) => b.returned
    ).length;

    const currentlyBorrowed = borrows.filter(
      (b) => !b.returned
    ).length;

    const lostBooks = borrows.filter(
      (b) => b.isLost
    ).length;

    const totalFinePaid = borrows.reduce(
      (sum, b) =>
        b.finePaid ? sum + (b.fine || 0) : sum,
      0
    );

    const totalReplacementCostPaid =
      borrows.reduce(
        (sum, b) =>
          b.replacementCostPaid
            ? sum + (b.replacementCost || 0)
            : sum,
        0
      );

    res.status(200).json({
      member,

      statistics: {
        totalBooksBorrowed,
        totalBooksReturned,
        currentlyBorrowed,
        lostBooks,
        totalFinePaid,
        totalReplacementCostPaid,
      },

      borrowHistory: borrows,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getLibrarianDashboard,
  getMyPerformance,
  getMemberAnalytics,
};