const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Returns true if the username is valid (non-empty and not already taken)
  if (!username) return false;
  let userswithsamename = users.filter((user) => user.username === username);
  return userswithsamename.length === 0;
};

const authenticatedUser = (username, password) => {
  // Returns true if username and password match any registered user record
  let matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
};

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in: username and password required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password,
      username: username
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "Customer successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 8: Add or modify a book review (logged-in users only)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let review = req.query.review;
  if (!review && req.body && req.body.review) {
    review = req.body.review;
  }

  let username = null;
  if (req.session && req.session.authorization && req.session.authorization.username) {
    username = req.session.authorization.username;
  } else if (req.user) {
    username = req.user.username || (req.user.data && req.user.data.username) || (typeof req.user.data === 'string' ? req.user.data : null);
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `The review for the book with ISBN ${isbn} has been added/updated.`,
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete a book review (users can delete only their own reviews)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let username = null;
  if (req.session && req.session.authorization && req.session.authorization.username) {
    username = req.session.authorization.username;
  } else if (req.user) {
    username = req.user.username || (req.user.data && req.user.data.username) || (typeof req.user.data === 'string' ? req.user.data : null);
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: `Review for ISBN ${isbn} not found for user ${username}` });
  }

  delete books[isbn].reviews[username];

  return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
