const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
const handleRegister = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user. Username and password are required." });
};

public_users.post("/register", handleRegister);
public_users.post("/customer/register", handleRegister);

// Task 1: Get the book list available in the shop using Promises
public_users.get('/', function (req, res) {
  const get_books = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject({ status: 500, message: "Error retrieving books" });
    }
  });

  get_books
    .then((bookList) => {
      return res.status(200).send(JSON.stringify(bookList, null, 4));
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});

// Task 2: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const get_book = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  get_book
    .then((book) => {
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});
  
// Task 3: Get book details based on author using Promises
public_users.get('/author/:author', function (req, res) {
  const get_books_by_author = new Promise((resolve, reject) => {
    const author = req.params.author.toLowerCase();
    const matching_books = [];
    const isbns = Object.keys(books);

    isbns.forEach((isbn) => {
      if (books[isbn].author.toLowerCase() === author) {
        matching_books.push({
          isbn: isbn,
          author: books[isbn].author,
          title: books[isbn].title,
          reviews: books[isbn].reviews
        });
      }
    });

    if (matching_books.length > 0) {
      resolve(matching_books);
    } else {
      reject({ status: 404, message: "No books found by this author" });
    }
  });

  get_books_by_author
    .then((matching_books) => {
      return res.status(200).send(JSON.stringify(matching_books, null, 4));
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});

// Task 4: Get all books based on title using Promises
public_users.get('/title/:title', function (req, res) {
  const get_books_by_title = new Promise((resolve, reject) => {
    const title = req.params.title.toLowerCase();
    const matching_books = [];
    const isbns = Object.keys(books);

    isbns.forEach((isbn) => {
      if (books[isbn].title.toLowerCase() === title) {
        matching_books.push({
          isbn: isbn,
          author: books[isbn].author,
          title: books[isbn].title,
          reviews: books[isbn].reviews
        });
      }
    });

    if (matching_books.length > 0) {
      resolve(matching_books);
    } else {
      reject({ status: 404, message: "No books found with this title" });
    }
  });

  get_books_by_title
    .then((matching_books) => {
      return res.status(200).send(JSON.stringify(matching_books, null, 4));
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// =========================================================================
// Task 10: 4 Methods using Async/Await and Promises with Axios
// =========================================================================

const BASE_URL = "http://localhost:5000";

// Method 1 (Task 10): Get all books available in the shop using Async/Await with Axios
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("All books retrieved successfully:");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error retrieving all books:", error.message);
    throw error;
  }
};

// Method 2 (Task 11): Get book details based on ISBN using Promises with Axios
const getBookByISBN = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      console.log(`Book details for ISBN ${isbn}:`);
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(`Error retrieving book for ISBN ${isbn}:`, error.message);
      throw error;
    });
};

// Method 3 (Task 12): Get book details based on Author using Async/Await with Axios
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`Books by author ${author}:`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(`Error retrieving books by author ${author}:`, error.message);
    throw error;
  }
};

// Method 4 (Task 13): Get book details based on Title using Promises with Axios
const getBooksByTitle = (title) => {
  return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => {
      console.log(`Books with title ${title}:`);
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(`Error retrieving books with title ${title}:`, error.message);
      throw error;
    });
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
