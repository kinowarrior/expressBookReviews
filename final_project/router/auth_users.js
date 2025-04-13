const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {"username": "john","password": "smith"},
  {"username": "joe","password": "bloggs"}
];

const isValid = (username)=>{ //returns boolean
  // Check if a user with the given username already exists in the users array
  const userExists = users.some(user => user.username === username);
  return !userExists; // Return true if username is NOT found (i.e., it's valid/available)
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  // return res.status(300).json({message: "Yet to be implemented"});
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  const username = req.session.authorization?.username; // Safely access username

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!reviewText) {
    return res.status(400).json({ message: "Review text is required as a query parameter" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found for this ISBN" });
  }

  // Initialize reviews object if it doesn't exist
  if (!book.reviews) {
    book.reviews = {};
  }

  // Add or update the review for the logged-in user
  book.reviews[username] = reviewText;

  return res.status(200).json({ message: `Review for ISBN ${isbn} by user ${username} added/updated successfully`, reviews: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const book = books[isbn];

  if (!book || !book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user and ISBN" });
  }

  // Delete the user's review
  delete book.reviews[username];

  return res.status(200).json({ message: `Review for ISBN ${isbn} by user ${username} deleted successfully`, reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
