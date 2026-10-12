const express = require('express');
const router = express.Router();
const { 
  bookFreeTicket, 
  createOrder, 
  verifyPayment, 
  getMyTickets, 
  scanTicket 
} = require('../controllers/ticketController');
const { protect, club } = require('../middleware/authMiddleware');

router.get('/my-tickets', protect, getMyTickets);
router.post('/book-free', protect, bookFreeTicket);
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/scan', protect, club, scanTicket);

module.exports = router;
