const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../Utils/jwtUtils.js');
const Booklist = require('../models/Booklist.js');

// verify userRole
async function isAdmin(req, res, next) {
    if (req.user && req.user.userRole == "admin") {
        next();
    } else {
        res.status(403).send('Access denied');
    }
}


/* GET /admin/users
  description: Get all users
  Params: token
  Success: 200, Users
  Error: 500, Error retrieving users
*/
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        // get all users
        const users = await User.find({}).select('-passwordHash -__v');
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving users');
    }
});

/* PUT /admin/update-user
    description: Update user
    Params: token, userId, updateData
    Success: 200, User updated successfully
    Error: 404, User not found
*/
router.put('/update-user', authenticateToken, isAdmin, async (req, res) => {
    const updateData = req.body;
    const userId = req.body.userId;

    try {
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-passwordHash -__v');

        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).send('User updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user');
    }
});


/* GET /admin/get-reviews
    description: Get all review
    Params: none
    Success: 200, Review
    Error: 404, Review not found
    */
    router.get('/get-reviews', authenticateToken, isAdmin, async (req, res) => {
        try {
            const booklistItem = await Booklist.find({});
            if (!booklistItem) {
                return res.status(404).send('Review not found');
            }
            let reviews = [];
            // add booklistId and reviewId to each review
            booklistItem.forEach(booklistItem => {
                booklistItem.reviews.forEach(review => {
                    reviews.push({
                        booklistId: booklistItem.booklistId,
                        ...review._doc
                    });
                });
            });
            res.json(reviews);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error retrieving review');
        }
    })
    
    
    /* PUT admin/update-review
      description: Update a review
      Params: reviewId, rating, comment
      Success: 200, Review updated successfully
      Error: 500, Internal server error
    */
    router.put('/update-review', authenticateToken, isAdmin, async (req, res) => {
        const { booklistId, reviewId, hidden } = req.body;
    
        try {
            const booklistItem = await Booklist.findOne({ booklistId });
            const review = booklistItem.reviews.id(reviewId);
            if (!review) {
                return res.status(404).send('Review not found');
            }
    
            review.hidden = hidden; // Update the review status
            await booklistItem.save();
            res.status(200).send('Review updated successfully');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error updating review');
        }
    });
    
module.exports = router;