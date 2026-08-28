const crypto = require('crypto');
const Razorpay = require('razorpay');
const Book = require('../models/Book');
const Rental = require('../models/Rental');
const User = require('../models/User');

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret
  });
};

// @desc    Get active Razorpay Key ID for frontend
// @route   GET /api/payments/key
const getPaymentKey = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    res.json({
      success: true,
      keyId,
      isConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { bookId, weeksDuration, location, deliveryType, deliveryAddress } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'No copies available at the moment' });
    }

    // Check active rental
    const activeRental = await Rental.findOne({
      user: req.user._id,
      book: bookId,
      status: { $in: ['pending', 'approved', 'active'] }
    });
    if (activeRental) {
      return res.status(400).json({ success: false, message: 'You already have an active rental for this book' });
    }

    const duration = Number(weeksDuration);
    if (!duration || duration < 1) {
      return res.status(400).json({ success: false, message: 'Invalid rental duration' });
    }

    if (book.allowedRentalWeeks && book.allowedRentalWeeks.length > 0) {
      if (!book.allowedRentalWeeks.includes(duration)) {
        return res.status(400).json({
          success: false,
          message: `Allowed rental durations for this book are: ${book.allowedRentalWeeks.join(', ')} weeks`
        });
      }
    } else {
      const minW = book.minRentalWeeks || 1;
      const maxW = book.maxRentalWeeks || 8;
      if (duration < minW || duration > maxW) {
        return res.status(400).json({
          success: false,
          message: `Rental duration must be between ${minW} and ${maxW} weeks`
        });
      }
    }

    const totalCost = book.pricePerWeek * duration;
    const amountInPaise = Math.round(totalCost * 100);

    const razorpay = getRazorpayInstance();
    const isConfigured = !!razorpay;

    let order;
    if (isConfigured) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-4)}`,
        notes: {
          bookId: book._id.toString(),
          bookTitle: book.title,
          userId: req.user._id.toString(),
          userName: req.user.name,
          location: location || 'Nagpur'
        }
      };
      order = await razorpay.orders.create(options);
    } else {
      // Development mock order if Razorpay credentials not yet provided in .env
      order = {
        id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        amount: amountInPaise,
        currency: 'INR'
      };
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      totalCost,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      book: {
        id: book._id,
        title: book.title,
        author: book.author,
        cover: book.cover
      },
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || ''
      },
      isConfigured
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to initialize payment' });
  }
};

// @desc    Verify Razorpay Payment Signature and finalize rental
// @route   POST /api/payments/verify-payment
const verifyPaymentAndCreateRental = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookId,
      weeksDuration,
      location,
      deliveryType,
      deliveryAddress,
      userNote
    } = req.body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // Cryptographic signature verification
    if (key_secret && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid transaction signature'
        });
      }
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const duration = Number(weeksDuration) || 1;
    const totalCost = book.pricePerWeek * duration;

    // Create the confirmed paid rental
    const rental = await Rental.create({
      user: req.user._id,
      book: bookId,
      weeksDuration: duration,
      totalCost,
      location: location || 'Nagpur',
      deliveryType: deliveryType || 'pickup',
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : {},
      userNote: userNote || '',
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'ONLINE_RAZORPAY',
      paymentId: razorpay_payment_id || `PAY_${Date.now()}`
    });

    await rental.populate('book', 'title author cover pricePerWeek');
    await rental.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      rental,
      message: 'Payment verified and rental request placed successfully!'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment processing error' });
  }
};

module.exports = {
  getPaymentKey,
  createPaymentOrder,
  verifyPaymentAndCreateRental
};
