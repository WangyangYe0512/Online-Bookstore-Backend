const express = require('express');
const router = express.Router();
const bookshelf = require('../models/Bookshelf.js');
const { authenticateToken } = require('../Utils/jwtUtils.js');
const booklist = require('../models/Booklist.js');
const GOOGLE_BOOKS_API_URL = process.env.GOOGLE_BOOKS_API_URL;

/* GET booklist/
  description: Get all private booklists
  Params: None
  Success: 200, return all books
  Error: 500, Internal server error
*/
router.get('/', authenticateToken,  async (req, res) => {
  try {
    const books = await bookshelf.find({userId:req.user.userId}).select('-__v');
    res.status(200).json({kind: "books#bookshelves",items:books});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving books');
  }
});

/* POST bookshelf/create
  description: create a new bookshlf
  Params: title, description, access
  Success: 201, Book added successfully
  Error: 500, Internal server error
*/
router.post('/create', authenticateToken, async (req, res) => {
  const { title, description, access, volumeCount } = req.body;
  const userId = req.user.userId;
  const userName = req.user.userName;

  try {
    const nowDate = new Date();
    const newBookshelf = new bookshelf({
      title,
      description,
      access,
      userId,
      userName,
      volumeCount: volumeCount ? volumeCount: 0,
      volumesLastUpdated: nowDate,
      created: nowDate,
      updated: nowDate

    });

    await newBookshelf.save();

    // Also create a booklist for this bookshelf
    const newBooklist = new booklist({
      booklistId: newBookshelf._id,
      userId,
      items: []
    });
    await newBooklist.save();

    res.status(201).send('Booklist added successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding book');
  }
});

/* PUT bookshelf/update
  description: Update a specific book
  Params: bookId, updateData
  Success: 200, Book updated successfully
  Error: 404, Book not found
*/
router.put('/update', authenticateToken, async (req, res) => {
  const updateData = req.body;
  const bookshelfId = req.body.bookshelfId;

  try {
    const newBookshelf = await bookshelf.findByIdAndUpdate(bookshelfId, updateData, { new: true }).select('-__v');

    if (!newBookshelf) {
      return res.status(404).send('Book not found');
    }
    newBookshelf.updated = new Date();
    await newBookshelf.save();
    res.status(200).send('Booklist updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating book');
  }
});
/* DELETE bookshelf/delete
  description: Delete a specific book
  Params: bookId
  Success: 200, Book deleted successfully
  Error: 404, Book not found
*/
router.delete('/delete', authenticateToken, async (req, res) => {
  const { bookshelfId } = req.query;
  try {
    const result = await bookshelf.deleteOne({ _id:bookshelfId });

    if (result.deletedCount === 0) {
      return res.status(404).send('Book not found');
    }
    // Also delete the booklist for this bookshelf
    const result2 = await booklist.deleteOne({ booklistId:bookshelfId });
    if (result2.deletedCount === 0) {
      return res.status(404).send('Booklist not found');
    }
    res.status(200).send('Book deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting book');
  }
});

/* GET /booklist
  description: Get booklist by id
  Params: booklistId
  Success: 200, return all books
  Error: 500, Internal server error
*/
router.get('/booklist', authenticateToken, async (req, res) => {
  const { booklistId } = req.query;

  try {
    const result = await booklist.findOne({booklistId});
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving booklist');
  }
});
/* POST booklist/add
  description: Add a book to a booklist
  Params: booklistId, bookId
  Success: 201, Book added successfully
  Error: 500, Internal server error
*/
router.post('/booklist/add', authenticateToken, async (req, res) => {
  const { booklistId, bookId } = req.body;

  try {
    const newBooklist = await booklist.findOne({booklistId});
    if (!newBooklist) {
      return res.status(404).send('Booklist not found');
    }
    // Check if the book already exists in the booklist
    const index = newBooklist.items.findIndex((item) => item.id === bookId);
    if (index > -1) {
      return res.status(200).send('Book already exists in the booklist');
    }
    // Check if the booklist has reached the limit of 20 books
    if (newBooklist.totalItems >= 20) {
      return res.status(200).send('Booklist has reached the limit of 20 books');
    }
    // Get bookinfo from bookId using Google Books API
    const url = `${GOOGLE_BOOKS_API_URL}/${bookId}`;
    const response = await fetch(url);
    const data = await response.json();
    const bookInfo = data;
    // Add book to booklist
    newBooklist.items.push(bookInfo);
    newBooklist.totalItems = newBooklist.items.length;
    await newBooklist.save();
    // Update the volumeCount and volumesLastUpdated of the bookshelf
    const newBookshelf = await bookshelf.findById(booklistId);
    if (!newBookshelf) {
      return res.status(404).send('Bookshelf not found');
    }
    newBookshelf.volumeCount = newBooklist.items.length;
    newBookshelf.volumesLastUpdated = new Date();
    await newBookshelf.save();
    res.status(201).send('Book added successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding book');
  }
});
/* DELETE booklist/delete
  description: Delete a book from a booklist
  Params: booklistId, bookId
  Success: 200, Book deleted successfully
  Error: 404, Book not found
*/
router.delete('/booklist/delete', authenticateToken, async (req, res) => {
  const { booklistId, bookId } = req.query;
  try {
    const newBooklist = await booklist.findOne({booklistId});
    const index = newBooklist.items.findIndex((item) => item.id === bookId);
    if (index > -1) {
      newBooklist.items.splice(index, 1);
      newBooklist.totalItems = newBooklist.items.length;
      await newBooklist.save();
      // Update the volumeCount and volumesLastUpdated of the bookshelf
      const newBookshelf = await bookshelf.findOne({ _id:booklistId });
      newBookshelf.volumeCount = newBooklist.items.length;
      newBookshelf.volumesLastUpdated = new Date();
      await newBookshelf.save();
      res.status(200).send('Book deleted successfully');
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting book');
  }
});
module.exports = router;