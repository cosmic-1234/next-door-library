const express = require('express');
const router = express.Router();
const {
  getPaymentKey,
  createPaymentOrder,
  verifyPaymentAndCreateRental
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/key', getPaymentKey);
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify-payment', protect, verifyPaymentAndCreateRental);

module.exports = router;
