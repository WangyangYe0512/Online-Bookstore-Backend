const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Utils/jwtUtils.js');
const Cart = require('../models/Cart.js');

/* POST /cart/add
  description: Add a product to cart
  Params: token, bookId
  Success: 200, Product added to cart successfully
  Error: 500, Error adding product to cart
*/
router.post('/add', authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const { book, quantity, price } = req.body;
  try {
      // find cart by userId
      let cart = await Cart.findOne({ userId });
      // if cart doesn't exist, create a new cart
      if (!cart) {
          cart = new Cart({ userId, items: [] });
      }
      // check if product already exists in cart
      const itemIndex = cart.items.findIndex(item => item.book.bookId === book.bookId);
      if (itemIndex > -1) {
          // if product exists, update quantity
          let item = cart.items[itemIndex];
          item.quantity += quantity;
      } else {
          // if product doesn't exist, add new product
          cart.items.push({ book, quantity, price });
      }
      // save cart
      await cart.save();

      res.status(200).send('Product added to cart successfully');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error adding product to cart');
  }
});

/* GET /cart
  description: Get cart by userId
  Params: token
  Success: 200, Cart
  Error: 404, Cart not found
*/
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
      // find cart by userId
      const cart = await Cart.findOne({ userId });

      if (cart) {
          res.json(cart);
      } else {
          res.status(404).send('Cart not found');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving cart');
  }
});


/* PUT /cart/update
  description: Update cart
  Params: token, bookId, quantity
  Success: 200, Cart updated successfully
  Error: 404, Cart not found
*/
router.put('/update', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { bookId, quantity } = req.body;

  try {
      // find cart by userId
      const cart = await Cart.findOne({ userId });

      if (!cart) {
          return res.status(404).send('Cart not found');
      }
      // find item in cart
      const itemIndex = cart.items.findIndex(item => item.book.bookId === bookId);

      if (itemIndex > -1) {
          // if quantity > 0, update quantity, else remove item from cart
          if (quantity > 0) {
              cart.items[itemIndex].quantity = quantity;
          } else {
              cart.items.splice(itemIndex, 1);
          }
          await cart.save();
          res.send('Cart updated successfully');
      } else {
          res.status(404).send('Item not found in cart');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Error updating cart');
  }
});

/* DELETE /cart/remove
  description: Remove item from cart
  Params: token, bookId
  Success: 200, Item removed from cart successfully
  Error: 404, Cart not found
*/
router.delete('/remove', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { bookId } = req.body;

  try {
      // find cart by userId
      const cart = await Cart.findOne({ userId });

      if (!cart) {
          return res.status(404).send('Cart not found');
      }

      // find item in cart
      const itemIndex = cart.items.findIndex(item => item.book.bookId === bookId);

      if (itemIndex > -1) {
          // remove item from cart
          cart.items.splice(itemIndex, 1);
          await cart.save();
          res.send('Item removed from cart successfully');
      } else {
          res.status(404).send('Item not found in cart');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Error removing item from cart');
  }
});

module.exports = router;  