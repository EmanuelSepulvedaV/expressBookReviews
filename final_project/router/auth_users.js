const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send({ message: "User successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  let book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  let existingReview = null;
  for (let reviewKey in book.reviews) {
    if (book.reviews[reviewKey].username === username) {
      existingReview = book.reviews[reviewKey];
      break;
    }
  }
  if (existingReview) {
    existingReview.review = review;
  } else {
    book.reviews[username] = { username, review };
  }

  books[isbn] = book;

  return res.status(200).json({ message: "Review successfully posted" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  let book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  let existingReview = null;
  for (let reviewKey in book.reviews) {
    if (book.reviews[reviewKey].username === username) {
      existingReview = book.reviews[reviewKey];
      break;
    }
  }
  if (existingReview) {
    delete book.reviews[existingReview.username];
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
  books[isbn] = book;

  return res.status(200).json({ message: "Review successfully deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
