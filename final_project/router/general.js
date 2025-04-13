const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username is valid (i.e., does not already exist)
  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add the new user to the users array
  users.push({ username: username, password: password });

  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop (using async/await for educational purposes)
public_users.get('/', async function (req, res) {
  try {
    // Simulate an asynchronous operation with Promise.resolve
    const booksJson = await Promise.resolve(JSON.stringify(books, null, 2));
    res.status(200).send(booksJson);
  } catch (error) {
    // Basic error handling (unlikely to be triggered by stringify)
    console.error("Error fetching book list:", error);
    res.status(500).json({ message: "Error retrieving book list" });
  }
});

// Get book details based on ISBN (using async/await for educational purposes)
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    // Simulate async fetch with Promise.resolve
    const book = await Promise.resolve(books[isbn]);

    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found for this ISBN" });
    }
  } catch (error) {
    console.error(`Error fetching book by ISBN ${isbn}:`, error);
    res.status(500).json({ message: "Error retrieving book details" });
  }
});
  
// Get book details based on author (using async/await for educational purposes)
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    // Simulate async fetch/filter with Promise.resolve
    const allBookValues = await Promise.resolve(Object.values(books)); 
    const booksByAuthor = allBookValues.filter(book => book.author === author);

    if (booksByAuthor.length > 0) {
      res.status(200).json(booksByAuthor);
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error);
    res.status(500).json({ message: "Error retrieving book details" });
  }
});

// Get all books based on title (using async/await for educational purposes)
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    // Simulate async fetch/filter with Promise.resolve
    const allBookValues = await Promise.resolve(Object.values(books)); 
    const booksByTitle = allBookValues.filter(book => book.title === title);

    if (booksByTitle.length > 0) {
      res.status(200).json(booksByTitle);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    console.error(`Error fetching books by title ${title}:`, error);
    res.status(500).json({ message: "Error retrieving book details" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    res.status(200).json(book.reviews);
  } else if (book) {
    // Book found, but has no reviews property (or it's empty)
    res.status(200).json({}); // Return empty object as per common practice
  } else {
    res.status(404).json({ message: "Book not found for this ISBN" });
  }
});

module.exports.general = public_users;
