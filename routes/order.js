const Order = require('../models/Order.js'); 
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Utils/jwtUtils.js');
const mongoose = require('mongoose');

/* GET order/create
  description: Create a new order
  Params: items
  Success: 200, Order created successfully
  Error: 500, Internal server error
*/
router.post('/create', authenticateToken, async (req, res) => {
  const userId = req.user.userId
  const { items } = req.body;
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  try {
      const newOrder = new Order({
          userId,
          items,
          totalPrice,
          orderDate: new Date(),
          status: 'pending'
      });

      await newOrder.save();
      res.status(201).send('Order created successfully');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error creating order');
  }
});

/* GET order/
  description: Get all orders for the logged in user
  Params: None
  Success: 200, return all orders for the logged in user
  Error: 500, Internal server error
*/
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
      const orders = await Order.find({ userId });
      res.json(orders);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving orders');
  }
});

/* GET order/
  description: Update a specific order
  Params: orderId, status
  Success: 200, return the order
  Error: 404, Order not found
*/
router.put('/update', authenticateToken, async (req, res) => {
  const { orderId, status } = req.body;
  try {
      const order = await Order.findOne({ orderId: orderId});

      if (!order) {
          return res.status(404).send('Order not found');
      }

      order.status = status; // Update the order status
      await order.save();
      res.send('Order updated successfully');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error updating order');
  }
});
/* DELETE order/:orderId
  description: Delete a specific order
  Params: orderId
  Success: 200, Order deleted successfully
  Error: 404, Order not found
*/
router.delete('/delete', authenticateToken, async (req, res) => {
  const { orderId } = req.query;
  try {
      const result = await Order.deleteOne({ orderId: orderId});
      if (result.deletedCount === 0) {
          return res.status(404).send('Order not found');
      }
      res.send('Order deleted successfully');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting order');
  }
});


module.exports = router;