const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

public_users.get("/", (req, res) => {
  Promise.resolve()
    .then(() => {
      res.send(JSON.stringify(books, null, 4));
    })
    .catch((error) => {
      console.error("Error fetching book list:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

public_users.get("/isbn/:isbn", (req, res) => {
  Promise.resolve()
    .then(() => {
      let book = books[req.params.isbn];
      if (book) {
        res.send(JSON.stringify(book, null, 4));
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    })
    .catch((error) => {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

public_users.get("/author/:author", (req, res) => {
  Promise.resolve()
    .then(() => {
      let authorBooks = Object.keys(books)
        .filter((isbn) => books[isbn].author.toLowerCase() === req.params.author.toLowerCase())
        .map((isbn) => books[isbn]);
      if (authorBooks.length > 0) {
        res.send(JSON.stringify(authorBooks, null, 4));
      } else {
        res.status(404).json({ message: "No books found by this author" });
      }
    })
    .catch((error) => {
      console.error("Error fetching books by author:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

public_users.get("/title/:title", (req, res) => {
  Promise.resolve()
    .then(() => {
      let titleBooks = Object.keys(books)
        .filter((isbn) => books[isbn].title.toLowerCase() === req.params.title.toLowerCase())
        .map((isbn) => books[isbn]);
      if (titleBooks.length > 0) {
        res.send(JSON.stringify(titleBooks, null, 4));
      } else {
        res.status(404).json({ message: "No books found with this title" });
      }
    })
    .catch((error) => {
      console.error("Error fetching books by title:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

public_users.get("/review/:isbn", function (req, res) {
  let book = books[req.params.isbn];
  if (book) {
    res.send(JSON.stringify(book.reviews, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
