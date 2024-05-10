const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const bookshelf = require('../models/Bookshelf');
const booklist = require('../models/Booklist');

/* GET /open/search
  description: Search for books
  Params: q, page, limit
  Success: 200, { currentPage: 1, items: [ ... ], isFinalPage: false }
  Error: 400, Query parameter "q" is required
*/
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
    const startIndex = (page - 1) * limit; // Calculate the start index for the current page
    const requestLimit = limit + 1; // Fetch one extra item to determine if there are more pages

    if (!query) {
        return res.status(400).send('Query parameter "q" is required');
    }

    const url = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${requestLimit}`;

    const response = await fetch(url);
    const data = await response.json();
    let isFinalPage = false; // Flag to determine if this is the last page
    let items = data.items || [];

    // if the number of items returned is less than the request limit, then we know that this is the last page
    if (items.length < requestLimit) {
      isFinalPage = true;
    } else {
        // Remove the extra item fetched from the API
        items = items.slice(0, -1);
    }

    res.json({
        currentPage: page,
        items: items,
        isFinalPage: isFinalPage
    });
  } catch (error) {
      console.error('Error during fetching books:', error);
      res.status(500).send('An error occurred while searching for books');
  }
});

/* GET /bookshelf
  description: Get all public bookshelves
  Params: None
  Success: 200, return all bookshelves
  Error: 500, Internal server error
*/
router.get('/bookshelf', async (req, res) => {
  try {
      const bookshelves = await bookshelf.find({access: 'PUBLIC'});
      res.json(bookshelves);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving books');
  }
});

/* GET /booklist/
  description: Get public booklists
  Params: None
  Success: 200, return all booklists
  Error: 500, Internal server error
*/
router.get('/booklist', async (req, res) => {
  const booklistId = req.query.booklistId;
  try {
      const booklists = await booklist.findOne({booklistId});
      res.json(booklists);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving books');
  }
});

module.exports = router;