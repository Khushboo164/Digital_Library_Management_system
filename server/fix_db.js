const mongoose = require('mongoose');
const Borrow = require('./models/Borrow');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    const buggyBorrows = await Borrow.find({ returned: true, status: "Borrowed" });
    console.log(`Found ${buggyBorrows.length} buggy borrows.`);
    
    for (let borrow of buggyBorrows) {
      borrow.returned = false;
      borrow.status = "Return Requested";
      
      const Book = require('./models/Book');
      const book = await Book.findById(borrow.book);
      if (book) {
          book.availableCopies -= 1;
          await book.save();
      }
      
      await borrow.save();
    }
    console.log("Fixed!");
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
