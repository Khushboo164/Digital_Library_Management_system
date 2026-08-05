const axios = require("axios");
const Book = require("../models/book");

const categories = [
  "fiction",
  "technology",
  "science",
  "history",
  "biography",
  "self_help",
  "business",
  "finance",
  "psychology",
  "mystery"
];

const importBooks = async () => {
  try {

    // Don't import again if books already exist
    const count = await Book.countDocuments();

    if (count > 0) {
      console.log("Books already exist. Skipping import...");
      return;
    }

    console.log("Starting Book Import...\n");

    let imported = 0;

    for (const category of categories) {

      console.log(`Importing ${category} books...`);

      const response = await axios.get(
        `https://openlibrary.org/subjects/${category}.json?limit=15`
      );

      const books = response.data.works;

      for (const item of books) {

        // Unique identifier
        const uniqueId =
          item.cover_edition_key ||
          item.key;

        // Skip duplicates
        const exists = await Book.findOne({
          isbn: uniqueId
        });

        if (exists)
          continue;

        await Book.create({

          title: item.title || "Unknown",

          author:
            item.authors && item.authors.length
              ? item.authors
                  .map(author => author.name)
                  .join(", ")
              : "Unknown",

          // Using edition/work key as unique identifier
          isbn: uniqueId,

          category:
            category
              .replace("_", " ")
              .replace(/\b\w/g, c => c.toUpperCase()),

          description: "",

          coverImage:
            item.cover_id
              ? `https://covers.openlibrary.org/b/id/${item.cover_id}-L.jpg`
              : "",

          publisher: "",

          publishedYear:
            item.first_publish_year || null,

          language: "English",

          totalCopies: 5,

          availableCopies: 5,

        });

        imported++;

      }

      console.log(`${category} imported successfully.`);

    }

    console.log("\n================================");
    console.log(`${imported} Books Imported Successfully`);
    console.log("================================");

  } catch (error) {

    console.error(error.message);

  }
};

module.exports = importBooks;