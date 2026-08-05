const User = require("../models/User");
const Borrow = require("../models/Borrow");
const bcrypt = require("bcryptjs");

const syncUserFines = async (userId) => {
    try {
        const overdueBorrows = await Borrow.find({
            user: userId,
            returned: false,
            isLost: false,
            dueDate: { $lt: new Date() },
            finePaid: { $ne: true }
        });
        
        for (let b of overdueBorrows) {
            const daysLate = Math.floor((new Date() - new Date(b.dueDate)) / (1000 * 60 * 60 * 24));
            if (daysLate > 0) {
                const newFine = daysLate * 5;
                if (newFine > (b.fine || 0)) {
                    b.fine = newFine;
                    await b.save();
                }
            }
        }
    } catch (e) {
        console.error("Error syncing fines:", e);
    }
};

//APi - http://localhost:5000/api/member/dashboard ,with member token in header
const getMemberDashboard = async (req, res) => {
  try {

    const userId = req.user.id;
    await syncUserFines(userId);

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
        finePaid: { $ne: true }
      });

    const Wishlist = require("../models/Wishlist");
    const wishlistCount = await Wishlist.countDocuments({ user: userId });

    const Reservation = require("../models/Reservation");
    const activeReservations = await Reservation.find({ user: userId, status: { $in: ["Pending", "Available"] } }).populate("book", "title coverImage").limit(5);

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

    // The previous definitions for pendingFine and pendingReplacementCost are on lines 60-80, so we just use those.
    // Financial Records (Paid & Refunded from PaymentTransaction)
    const PaymentTransaction = require("../models/PaymentTransaction");
    const userPayments = await PaymentTransaction.find({ user: userId });

    let totalFinePaid = 0;
    let totalReplacementPaid = 0;
    let refundedAmount = 0;
    
    userPayments.forEach(p => {
       if (p.status === "Success") {
           if (p.paymentType === "Fine") totalFinePaid += p.amount;
           if (p.paymentType === "Replacement") totalReplacementPaid += p.amount;
       } else if (p.status === "Refunded") {
           refundedAmount += p.amount;
       }
    });

    const totalMoneySpent =
      totalFinePaid +
      totalReplacementPaid;  //kitna hum total spend krr chuke h 

    // Current Books
    const currentBooks =
      await Borrow.find({
        user: userId,
        returned: false,
        isLost: false,
        status: { $in: ["Borrowed", "Return Requested", "Return Rejected"] }
      }).populate(
        "book",
        "title author coverImage category"
      ); 

    const currentlyBorrowedBooks =
  currentBooks.map((borrow) => ({
      borrowId: borrow._id,
      title: borrow.book?.title,
      author: borrow.book?.author,
      coverImage: borrow.book?.coverImage,
      category: borrow.book?.category,
      borrowDate: borrow.borrowDate,
      dueDate: borrow.dueDate,
      fine: borrow.fine,
      isOverdue: borrow.dueDate < new Date()
  }));//currently kitni books borrowed h

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

    // Donut Analytics - status distribution of all borrows
    const statusCounts = {};
    allBorrows.forEach((b) => {
      let s;
      if (b.lostReported && b.isFound) {
        s = "Lost Book Returned";
      } else if (b.lostReported || b.isLost) {
        s = "Lost";
      } else {
        s = b.status || (b.returned ? "Returned" : "Borrowed");
      }
      if (s === "Borrowed" && b.dueDate && new Date(b.dueDate) < new Date()) {
        s = "Overdue";
      }
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    const donutAnalytics = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Recent Borrow History (last 5)
    const recentBorrowHistory = await Borrow.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("book", "title coverImage");

    // Pending Actions Counts
    const borrowRequestsWaiting = await Borrow.countDocuments({ user: userId, status: "Borrow Requested" });
    const returnRequestsWaiting = await Borrow.countDocuments({ user: userId, status: "Return Requested" });
    let reservedBooksAvailable = 0;
    // Enhanced currently borrowed books with status, daysRemaining, coverImage
    const enhancedCurrentBooks = await Borrow.find({
      user: userId,
      returned: false,
      $or: [
        { isLost: false, status: { $in: ["Borrowed", "Return Requested", "Return Rejected"] } },
        { isLost: true, replacementCostPaid: false }
      ]
    }).populate("book", "title author coverImage category");

    const enhancedCurrentlyBorrowedBooks = enhancedCurrentBooks.map((borrow) => {
      const now = new Date();
      const due = new Date(borrow.dueDate);
      const diffMs = due - now;
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        borrowId: borrow._id,
        title: borrow.book?.title,
        author: borrow.book?.author,
        coverImage: borrow.book?.coverImage,
        category: borrow.book?.category,
        borrowDate: borrow.borrowDate || borrow.createdAt,
        dueDate: borrow.dueDate,
        fine: borrow.fine,
        status: borrow.status || "Borrowed",
        daysRemaining,
        isOverdue: daysRemaining < 0,
        renewalCount: borrow.renewalCount || 0,
        replacementCost: borrow.replacementCost || 500
      };
    });

    // Upcoming due book
    let upcomingDueBook = null;
    if (enhancedCurrentlyBorrowedBooks.length > 0) {
      const sorted = [...enhancedCurrentlyBorrowedBooks].sort((a, b) => a.daysRemaining - b.daysRemaining);
      const nearest = sorted.find(b => b.daysRemaining >= 0) || sorted[0];
      if (nearest) {
        upcomingDueBook = { title: nearest.title, daysRemaining: nearest.daysRemaining };
      }
    }

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

      overviewStats: {
        totalSuccessfulBorrows: returnedBooks,
        currentlyBorrowedBooksCount: activeBorrows,
        totalPendingRequests: borrowRequestsWaiting + returnRequestsWaiting,
        wishlistCount,
        pendingPaymentsSum: pendingFine + pendingReplacementCost,
      },

      pendingActionsCounts: {
        borrowRequestsWaiting,
        returnRequestsWaiting,
        reservedBooksAvailable,
      },

      donutAnalytics,
      activityChart: Object.values(monthlyHistory),
      recentBorrowHistory,
      activeReservations,
      recommendationsPreview: [],
      upcomingDueBook,

      paymentSummary: {
        pendingFine,
        paidFine: totalFinePaid,
        pendingReplacementCost,
        paidReplacementCost: totalReplacementPaid,
        refundedAmount: refundedAmount,
        totalMoneySpent,
      },

      readingAnalytics: {
        readingScore,
        readingLevel,
      },

      currentlyBorrowedBooks: enhancedCurrentlyBorrowedBooks,

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

const getMemberProfile = async (req, res) => {
    try {
        const member = await User.findById(req.user.id).select("-password");
        if (!member) return res.status(404).json({ success: false, message: "Member not found" });
        res.status(200).json({ success: true, message: "Profile fetched successfully", member: { id: member._id, name: member.name, email: member.email, role: member.role, accountStatus: member.isBlocked ? "Blocked" : "Active", joinedAt: member.createdAt } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateMemberProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const member = await User.findById(req.user.id);
        if (!member) return res.status(404).json({ success: false, message: "Member not found" });

        if (name) member.name = name;
        if (email && email !== member.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ success: false, message: "Email already in use" });
            member.email = email;
        }

        if (currentPassword && newPassword) {
            const bcrypt = require("bcryptjs");
            const isMatch = await bcrypt.compare(currentPassword, member.password);
            if (!isMatch) return res.status(400).json({ success: false, message: "Invalid current password" });
            const salt = await bcrypt.genSalt(10);
            member.password = await bcrypt.hash(newPassword, salt);
        } else if (currentPassword || newPassword) {
            return res.status(400).json({ success: false, message: "Please provide both current and new password" });
        }

        await member.save();
        res.status(200).json({ success: true, message: "Profile updated successfully", member: { name: member.name, email: member.email } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMemberEmails = async (req, res) => {
    try {
        const EmailHistory = require("../models/EmailHistory");
        const emails = await EmailHistory.find({ 
            $or: [
                { memberId: req.user.id },
                { memberEmail: req.user.email }
            ]
        }).populate("sentBy", "name email").sort({ createdAt: -1 });
        res.status(200).json(emails);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch emails", error: error.message });
    }
};

const getCurrentBorrowedBooks = async (req, res) => {
    try {
        const currentBooks = await Borrow.find({ user: req.user.id, returned: false, isLost: false }).sort({ createdAt: -1 }).populate("book", "title author coverImage");
        res.status(200).json({ currentBooks });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

const getBorrowHistory = async (req, res) => {
    try {
        await syncUserFines(req.user.id);
        const borrowHistory = await Borrow.find({ user: req.user.id }).sort({ createdAt: -1 }).populate("book", "title author coverImage category");
        const formatted = borrowHistory.map(b => ({
            borrowId: b._id,
            bookId: b.book ? b.book._id : null,
            title: b.book ? b.book.title : "Unknown",
            author: b.book ? b.book.author : "Unknown",
            coverImage: b.book ? b.book.coverImage : null,
            category: b.book ? b.book.category : null,
            borrowDate: b.issueDate || b.borrowDate || b.requestDate,
            dueDate: b.dueDate,
            returnDate: b.returnReceiveDate || b.returnApprovalDate || null,
            status: b.status,
            isOverdue: !!(b.dueDate && new Date(b.dueDate) < new Date() && !b.returned && b.status !== "Lost"),
            fine: b.fine || 0,
            finePaid: b.finePaid || false,
            replacementCost: b.replacementCost || 0,
            replacementCostPaid: b.replacementCostPaid || false,
            isLost: b.isLost || false,
            lostReported: b.isLost || false,
            renewalCount: b.renewalCount || 0
        }));
        res.status(200).json({ borrowHistory: formatted });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

const getFineHistory = async (req, res) => {
    try {
        await syncUserFines(req.user.id);
        // Get fine records
        const fineRecords = await Borrow.find({ user: req.user.id, fine: { $gt: 0 } }).sort({ createdAt: -1 }).populate("book", "title");
        const replacementRecords = await Borrow.find({ user: req.user.id, isLost: true }).sort({ createdAt: -1 }).populate("book", "title");
        
        const fineHistory = [
            ...fineRecords.map(b => ({
                id: b._id,
                title: b.book ? b.book.title : "Unknown",
                type: "fine",
                amount: b.fine || 0,
                status: b.finePaid ? "Paid" : "Unpaid",
                date: b.finePaidDate || b.dueDate || b.updatedAt
            })),
            ...replacementRecords.filter(b => b.replacementCost > 0).map(b => {
                let pStatus = b.replacementCostPaid ? "Paid" : "Unpaid";
                if (b.replacementCostPaid && b.status === "Returned") {
                    pStatus = "Refunded";
                }
                return {
                    id: b._id,
                    title: b.book ? b.book.title : "Unknown",
                    type: "replacement",
                    amount: b.replacementCost,
                    status: pStatus,
                    date: b.replacementCostPaidDate || b.updatedAt
                };
            })
        ];
        res.status(200).json({ fineHistory });
    } catch (e) { res.status(500).json({ message: e.message }); }
};



const addToWishlist = async (req, res) => {
  try {
    const Wishlist = require("../models/Wishlist");
    const existing = await Wishlist.findOne({ user: req.user.id, book: req.body.bookId });
    if (existing) return res.status(400).json({ message: "Already in wishlist" });
    await Wishlist.create({ user: req.user.id, book: req.body.bookId });
    res.status(201).json({ message: "Added to wishlist" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const removeFromWishlist = async (req, res) => {
  try {
    const Wishlist = require("../models/Wishlist");
    await Wishlist.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Removed from wishlist" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const getWishlist = async (req, res) => {
    try {
        const Wishlist = require("../models/Wishlist");
        const wishlist = await Wishlist.find({ user: req.user.id }).sort({ createdAt: -1 }).populate("book", "title author coverImage category availableCopies");
        res.status(200).json({ wishlist });
    } catch (e) { res.status(500).json({ message: e.message }); }
};
const reserveBook = async (req, res) => {
  try {
    const Reservation = require("../models/Reservation");
    const existing = await Reservation.findOne({ user: req.user.id, book: req.body.bookId, status: "Pending" });
    if (existing) return res.status(400).json({ message: "Already reserved" });
    await Reservation.create({ user: req.user.id, book: req.body.bookId });
    res.status(201).json({ message: "Book reserved" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const cancelReservation = async (req, res) => {
  try {
    const Reservation = require("../models/Reservation");
    await Reservation.findByIdAndUpdate(req.params.id, { status: "Cancelled" });
    res.status(200).json({ message: "Reservation cancelled" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const getMyReservations = async (req, res) => {
    try {
        const Reservation = require("../models/Reservation");
        const reservations = await Reservation.find({ user: req.user.id }).sort({ createdAt: -1 }).populate("book", "title author coverImage category");
        res.status(200).json({ reservations });
    } catch (e) { res.status(500).json({ message: e.message }); }
};
const renewBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.body.borrowId);
    if (!borrow || borrow.user.toString() !== req.user.id) return res.status(404).json({ message: "Not found" });
    if (borrow.renewalCount >= 2) return res.status(400).json({ message: "Max renewals reached" });
    borrow.dueDate = new Date(borrow.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    borrow.renewalCount += 1;
    await borrow.save();
    res.status(200).json({ message: "Book renewed", borrow });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const getRenewHistory = async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user.id, renewalCount: { $gt: 0 } }).sort({ createdAt: -1 }).populate("book", "title coverImage");
    res.status(200).json({ renewHistory: borrows });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const getNotifications = async (req, res) => {
  try {
    const Notification = require("../models/Notification");
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (e) { res.status(200).json({ notifications: [] }); }
};
const markNotificationRead = async (req, res) => {
  try {
    const Notification = require("../models/Notification");
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const markAllNotificationsRead = async (req, res) => {
  try {
    const Notification = require("../models/Notification");
    await Notification.updateMany({ user: req.user.id }, { isRead: true });
    res.status(200).json({ message: "All marked as read" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const getRecommendedBooks = async (req, res) => {
  try {
    const Book = require("../models/Book");
    const recommendations = await Book.find({ isDeleted: { $ne: true } }).sort({ averageRating: -1 }).limit(10);
    res.status(200).json({ recommendations });
  } catch (e) { res.status(200).json({ recommendations: [] }); }
};
const getReadingStatistics = async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user.id });
    const totalBorrowed = borrows.length;
    const totalReturned = borrows.filter(b => b.returned).length;
    const totalLost = borrows.filter(b => b.isLost).length;
    const totalFine = borrows.reduce((s, b) => s + (b.fine || 0), 0);
    res.status(200).json({ stats: { totalBorrowed, totalReturned, totalLost, totalFine } });
  } catch (e) { res.status(200).json({ stats: {} }); }
};
const updateBookRating = async (bookId) => {
  const Rating = require("../models/Rating");
  const Book = require("../models/Book");
  const ratings = await Rating.find({ book: bookId });
  const ratingCount = ratings.length;
  const averageRating = ratingCount > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;
  await Book.findByIdAndUpdate(bookId, { ratingCount, averageRating });
};

const rateBook = async (req, res) => {
  try {
    const Rating = require("../models/Rating");
    const rating = await Rating.create({ user: req.user.id, book: req.body.bookId, rating: req.body.rating });
    await updateBookRating(req.body.bookId);
    res.status(201).json({ message: "Rating added", rating });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const updateRating = async (req, res) => {
  try {
    const Rating = require("../models/Rating");
    const rating = await Rating.findByIdAndUpdate(req.params.id, { rating: req.body.rating }, { new: true });
    if (rating) await updateBookRating(rating.book);
    res.status(200).json({ message: "Rating updated", rating });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const deleteRating = async (req, res) => {
  try {
    const Rating = require("../models/Rating");
    const rating = await Rating.findByIdAndDelete(req.params.id);
    if (rating) await updateBookRating(rating.book);
    res.status(200).json({ message: "Rating deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const getMyRatings = async (req, res) => {
  try {
    const Rating = require("../models/Rating");
    const ratings = await Rating.find({ user: req.user.id }).populate("book", "title coverImage");
    res.status(200).json({ ratings });
  } catch (e) { res.status(200).json({ ratings: [] }); }
};

const requestLostBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.body.borrowId);
    if (!borrow || borrow.user.toString() !== req.user.id) return res.status(404).json({ message: "Borrow record not found" });
    borrow.isLost = true;
    borrow.lostReported = true;
    borrow.lostReportedDate = new Date();
    borrow.lostRequestStatus = "Pending";
    const Book = require("../models/Book");
    const book = await Book.findById(borrow.book);
    borrow.replacementCost = book?.price || 500;
    borrow.status = "Lost";
    await borrow.save();
    res.status(200).json({ message: "Book reported as lost" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const cancelLostBookRequest = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.borrowId);
    if (!borrow) return res.status(404).json({ message: "Not found" });
    borrow.isLost = false;
    borrow.lostReported = false;
    borrow.lostRequestStatus = "Pending";
    borrow.replacementCost = 0;
    await borrow.save();
    res.status(200).json({ message: "Lost book request cancelled" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const returnFoundLostBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.borrowId);
    if (!borrow) return res.status(404).json({ message: "Not found" });
    borrow.status = "Return Requested";
    await borrow.save();
    res.status(200).json({ message: "Return requested for lost book" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const getLostBookRequests = async (req, res) => {
  try {
    const requests = await Borrow.find({ user: req.user.id, lostReported: true }).sort({ createdAt: -1 }).populate("book", "title coverImage author");
    res.status(200).json({ requests });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const createFinePayment = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.body.borrowId);
    if (!borrow) return res.status(404).json({ message: "Borrow not found" });
    const PaymentTransaction = require("../models/PaymentTransaction");
    const txn = await PaymentTransaction.create({
      user: req.user.id,
      borrowRecord: borrow._id,
      amount: borrow.fine,
      paymentType: "Fine",
      status: "Success",
      transactionId: "TXN-FINE-" + Date.now()
    });
    borrow.finePaid = true;
    borrow.finePaidDate = new Date();
    await borrow.save();
    res.status(200).json({ message: "Fine paid successfully", transaction: txn });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const verifyFinePayment = async (req, res) => { res.status(200).json({ message: "Payment verified" }); };
const getFinePaymentHistory = async (req, res) => {
  try {
    const PaymentTransaction = require("../models/PaymentTransaction");
    const history = await PaymentTransaction.find({ user: req.user.id, paymentType: "Fine" }).sort({ createdAt: -1 })
      .populate({ path: "borrowRecord", populate: { path: "book", select: "title" } });
    res.status(200).json({ history });
  } catch (e) { res.status(200).json({ history: [] }); }
};
const createReplacementPayment = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.body.borrowId);
    if (!borrow) return res.status(404).json({ message: "Borrow not found" });
    const PaymentTransaction = require("../models/PaymentTransaction");
    const txn = await PaymentTransaction.create({
      user: req.user.id,
      borrowRecord: borrow._id,
      amount: borrow.replacementCost,
      paymentType: "Replacement",
      status: "Success",
      transactionId: "TXN-REP-" + Date.now()
    });
    borrow.replacementCostPaid = true;
    borrow.replacementCostPaidDate = new Date();
    borrow.status = "Lost"; // Ensure status reflects it's lost and paid
    borrow.isLost = true; // Ensure isLost is true
    await borrow.save();
    res.status(200).json({ message: "Replacement cost paid successfully", transaction: txn });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
const verifyReplacementPayment = async (req, res) => { res.status(200).json({ message: "Payment verified" }); };
const getReplacementPaymentHistory = async (req, res) => {
  try {
    const PaymentTransaction = require("../models/PaymentTransaction");
    const history = await PaymentTransaction.find({ user: req.user.id, paymentType: "Replacement" }).sort({ createdAt: -1 })
      .populate({ path: "borrowRecord", populate: { path: "book", select: "title" } });
    res.status(200).json({ history });
  } catch (e) { res.status(200).json({ history: [] }); }
};

module.exports = {
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
  deleteRating,
  getMyRatings,
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
};
