const router = require('express').Router();
const { authenticateToken } = require('../Utils/jwtUtils.js');
const Booklist = require('../models/Booklist.js');
const mongoose = require('mongoose');

/* POST review/add
  description: Add a new review
  Params: bookId, rating, comment, username
  Success: 201, Review added successfully
  Error: 500, Internal server error
*/
router.post('/add', authenticateToken, async (req, res) => {
    const { booklistId, rating, comment } = req.body;
    const userId = req.user.userId;
    const username = req.user.userName;
    // find booklist by booklistId
    const booklistItem = await Booklist.findOne({ booklistId });

    try {
        const newReview = {
            username,
            userId,
            rating,
            comment,
            date: Date.now(),
            hidden: false
        };
        booklistItem.reviews.push(newReview);
        await booklistItem.save();
        res.status(201).send('Review added successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding review');
    }
});



/* DELETE review
  description: Delete a review
  Params: reviewId,booklistId
  Success: 200, Review deleted successfully
  Error: 500, Internal server error
*/
router.delete('/delete', authenticateToken, async (req, res) => {
    const { booklistId, reviewId } = req.query;
    // only allow the user who created the review and admin to delete it
    const userId = req.user.userId;
    const isAdmin = req.user.userRole === 'admin';
    const booklistItem = await Booklist.findOne({ booklistId });
    try {
        const index = booklistItem.reviews.findIndex(review => review._id.toString() === reviewId);
        if (index === -1) {
            return res.status(404).send('Review not found');
        }
        const review = booklistItem.reviews[index];
        if (!isAdmin && review.userId.toString() !== userId) {
            return res.status(401).send('Unauthorized');
        }
        booklistItem.reviews.splice(index, 1);
        await booklistItem.save();
        res.status(200).send('Review deleted successfully');
    } catch (error) {
        console.error(error);
        
        res.status(500).send('Error deleting review');
    }
});

module.exports = router;