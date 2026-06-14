const Rental = require('../models/Rental');
const Book = require('../models/Book');
const User = require('../models/User');

// @desc    Request to rent a book
// @route   POST /api/rentals
const requestRental = async (req, res) => {
  try {
    const { bookId, weeksDuration, deliveryType, deliveryAddress, userNote } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    if (book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'No copies available at the moment' });
    }

    // Check if user already has active rental for this book
    const activeRental = await Rental.findOne({
      user: req.user._id,
      book: bookId,
      status: { $in: ['pending', 'approved', 'active'] }
    });
    if (activeRental) {
      return res.status(400).json({ success: false, message: 'You already have an active rental for this book' });
    }

    const totalCost = book.pricePerWeek * weeksDuration;

    const rental = await Rental.create({
      user: req.user._id,
      book: bookId,
      weeksDuration,
      totalCost,
      deliveryType: deliveryType || 'pickup',
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : {},
      userNote: userNote || '',
      status: 'pending'
    });

    await rental.populate('book', 'title author cover pricePerWeek');
    await rental.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      rental,
      message: 'Rental request submitted! We will contact you within 24 hours.'
    });
  } catch (error) {
    console.error('Rental error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get my rentals
// @route   GET /api/rentals/my
const getMyRentals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const rentals = await Rental.find(query)
      .populate('book', 'title author cover pricePerWeek genre')
      .sort({ createdAt: -1 });

    res.json({ success: true, rentals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Return a book (user requests return)
// @route   PATCH /api/rentals/:id/return-request
const requestReturn = async (req, res) => {
  try {
    const rental = await Rental.findOne({ _id: req.params.id, user: req.user._id });
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }
    if (rental.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This rental is not currently active' });
    }

    rental.status = 'returned';
    rental.returnedAt = new Date();
    await rental.save();

    // Restore book availability
    await Book.findByIdAndUpdate(rental.book, { $inc: { availableCopies: 1 } });

    // Update user stats
    const user = await User.findById(req.user._id);
    user.totalBooksRead += 1;
    if (!user.readingHistory.includes(rental.book)) {
      user.readingHistory.unshift(rental.book);
    }
    if (user.currentlyReading && user.currentlyReading.toString() === rental.book.toString()) {
      user.currentlyReading = null;
    }
    await user.save();

    res.json({ success: true, message: 'Return recorded. Thank you for reading!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { requestRental, getMyRentals, requestReturn };
