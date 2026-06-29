const User = require("../models/User");
const Borrow = require("../models/Borrow");

//APi - http://localhost:5000/api/member/dashboard ,with member token in header
const getMemberDashboard = async (req, res) => {
  try {

    const userId = req.user.id;

    const user = await User.findById(userId) //returns user id
      .select("-password");  //hides password

    // Basic Statistics
    const booksBorrowed =
      await Borrow.countDocuments({
        user: userId, // kitni number of books borrow ki hui h
      });

    const activeBorrows =
      await Borrow.countDocuments({
        user: userId,
        returned: false,
        isLost: false,  //count of current borrowed books
      });

    const returnedBooks =
      await Borrow.countDocuments({
        user: userId,
        returned: true, //kitni books return ki hui h
      });

    const lostBooks =
      await Borrow.countDocuments({
        user: userId,
        isLost: true, //kitni books lost hai
      });

    const overdueBooks =
      await Borrow.countDocuments({
        user: userId,
        returned: false,
        isLost: false,
        dueDate: { $lt: new Date() }, //kitni books overdue hai
      });

    // Pending Fine
    const unpaidFines =
      await Borrow.find({
        user: userId,
        finePaid: false,
      }); //total kitni fine unpaid  h

    const pendingFine =
      unpaidFines.reduce(
        (total, borrow) =>
          total + (borrow.fine || 0),
        0
      ); //total kitni fine dena baaki h  hai

    // Pending Replacement Cost
    const unpaidReplacementCosts =
      await Borrow.find({
        user: userId,
        replacementCostPaid: false,
      }); //kitni replacement cost dena baki h

    const pendingReplacementCost =
      unpaidReplacementCosts.reduce(
        (total, borrow) =>
          total +
          (borrow.replacementCost || 0),
        0
      ); //kitni replacement cost de chuke h

    // Financial Records
    const paidRecords =
      await Borrow.find({
        user: userId,
      });

    const totalFinePaid =
      paidRecords
        .filter(
          (borrow) => borrow.finePaid
        )
        .reduce(
          (sum, borrow) =>
            sum + (borrow.fine || 0),
          0
        );  // kitni fine pay krr chuke h 

    const totalReplacementPaid =
      paidRecords
        .filter(
          (borrow) =>
            borrow.replacementCostPaid
        )
        .reduce(
          (sum, borrow) =>
            sum +
            (borrow.replacementCost || 0),
          0
        ); // kitni replacement cost pay krr chuke h 

    const totalMoneySpent =
      totalFinePaid +
      totalReplacementPaid;  //kitna hum total spend krr chuke h 

    // Current Books
    const currentBooks =
      await Borrow.find({
        user: userId,
        returned: false,
        isLost: false,
      }).populate(
        "book",
        "title author"
      ); 

    const currentlyBorrowedBooks =
      currentBooks.map(
        (borrow) => ({
          title:
            borrow.book?.title,
          author:
            borrow.book?.author,
          dueDate:
            borrow.dueDate,
        })
      ); //currently kitni books borrowed h

    // Next Due Date
    let nextDueDate = null;

    if (currentBooks.length > 0) {
      nextDueDate =
        currentBooks.sort(
          (a, b) =>
            new Date(
              a.dueDate
            ) -
            new Date(
              b.dueDate
            )
        )[0].dueDate; //next due date kb h
    }

    // Books Borrowed This Month
    const startOfMonth =
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );

    const booksBorrowedThisMonth =
      await Borrow.countDocuments({
        user: userId,
        createdAt: {
          $gte: startOfMonth,
        },
      });

    // Reading Score
    const readingScore =
      returnedBooks * 10 -
      lostBooks * 20;

    // Reading Level
    let readingLevel =
      "Beginner Reader";

    if (booksBorrowed > 50) {
      readingLevel =
        "Platinum Reader";
    } else if (
      booksBorrowed > 25
    ) {
      readingLevel =
        "Gold Reader";
    } else if (
      booksBorrowed > 10
    ) {
      readingLevel =
        "Silver Reader";
    }

    // Monthly History
    const allBorrows =
      await Borrow.find({
        user: userId,
      });

    const monthlyHistory = {};

    allBorrows.forEach(
      (borrow) => {

        const month =
          new Date(
            borrow.createdAt
          ).toLocaleString(
            "default",
            {
              month: "long",
              year: "numeric",
            }
          );

        if (
          !monthlyHistory[month]
        ) {
          monthlyHistory[
            month
          ] = {
            month,
            borrowed: 0,
            returned: 0,
          };
        }

        monthlyHistory[
          month
        ].borrowed += 1;

        if (
          borrow.returned
        ) {
          monthlyHistory[
            month
          ].returned += 1;
        }
      }
    );

    res.status(200).json({

      member: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus:
          user.isBlocked
            ? "Blocked"
            : "Active",
        joinedAt:
          user.createdAt,
      },

      statistics: {
        booksBorrowed,
        activeBorrows,
        returnedBooks,
        lostBooks,
        overdueBooks,
        booksBorrowedThisMonth,
      },

      financialSummary: {
        pendingFine,
        pendingReplacementCost,
        totalFinePaid,
        totalReplacementPaid,
        totalMoneySpent,
      },

      readingAnalytics: {
        readingScore,
        readingLevel,
      },

      currentlyBorrowedBooks,

      nextDueDate,

      monthlyHistory:
        Object.values(
          monthlyHistory
        ),
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getMemberDashboard,
};