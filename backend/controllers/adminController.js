const Book = require('../models/Book');
const User = require('../models/User');
const Rental = require('../models/Rental');
const ForumPost = require('../models/ForumPost');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalBooks, totalUsers, totalRentals, activeRentals, pendingRentals, overdueRentals] = await Promise.all([
      Book.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true, role: 'user' }),
      Rental.countDocuments(),
      Rental.countDocuments({ status: 'active' }),
      Rental.countDocuments({ status: 'pending' }),
      Rental.countDocuments({ status: 'active', dueDate: { $lt: new Date() } })
    ]);

    // Revenue from returned rentals
    const revenueResult = await Rental.aggregate([
      { $match: { status: 'returned' } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Rentals per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const rentalsByMonth = await Rental.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalCost' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Genre popularity
    const genreStats = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$genre', count: { $sum: '$totalRentals' } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    res.json({
      success: true,
      stats: {
        totalBooks, totalUsers, totalRentals, activeRentals,
        pendingRentals, overdueRentals, totalRevenue,
        rentalsByMonth, genreStats
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all books (admin)
// @route   GET /api/admin/books
const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, books, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create book
// @route   POST /api/admin/books
const createBook = async (req, res) => {
  try {
    const bookData = { ...req.body, addedBy: req.user._id };
    if (req.file) {
      bookData.cover = `/uploads/${req.file.filename}`;
    }
    bookData.availableCopies = bookData.totalCopies || 1;

    const book = await Book.create(bookData);
    res.status(201).json({ success: true, book });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update book
// @route   PATCH /api/admin/books/:id
const updateBook = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.cover = `/uploads/${req.file.filename}`;
    }

    const book = await Book.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete book (soft delete)
// @route   DELETE /api/admin/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    res.json({ success: true, message: 'Book removed from catalogue' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all rentals (admin)
// @route   GET /api/admin/rentals
const getAllRentals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Rental.countDocuments(query);
    const rentals = await Rental.find(query)
      .populate('user', 'name email phone')
      .populate('book', 'title author cover pricePerWeek')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, rentals, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update rental status (admin)
// @route   PATCH /api/admin/rentals/:id
const updateRentalStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found' });

    const oldStatus = rental.status;
    rental.status = status;
    if (adminNote) rental.adminNote = adminNote;

    // When approving → set dates and reduce availability
    if (status === 'active' && oldStatus !== 'active') {
      rental.rentedAt = new Date();
      rental.dueDate = new Date(Date.now() + rental.weeksDuration * 7 * 24 * 60 * 60 * 1000);
      await Book.findByIdAndUpdate(rental.book, { $inc: { availableCopies: -1, totalRentals: 1 } });

      // Set currentlyReading for user
      await User.findByIdAndUpdate(rental.user, { currentlyReading: rental.book });
    }

    // When returned → restore availability
    if (status === 'returned' && oldStatus === 'active') {
      rental.returnedAt = new Date();
      await Book.findByIdAndUpdate(rental.book, { $inc: { availableCopies: 1 } });
      await User.findByIdAndUpdate(rental.user, {
        currentlyReading: null,
        $addToSet: { readingHistory: rental.book },
        $inc: { totalBooksRead: 1 }
      });
    }

    // When cancelled → restore if was active
    if (status === 'cancelled' && oldStatus === 'active') {
      await Book.findByIdAndUpdate(rental.book, { $inc: { availableCopies: 1 } });
    }

    await rental.save();
    await rental.populate('user', 'name email phone');
    await rental.populate('book', 'title author cover');

    res.json({ success: true, rental });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user (admin)
// @route   PATCH /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const updateData = {};
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get forum posts (admin)
// @route   GET /api/admin/forum
const getAdminForum = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle pin/delete forum post (admin)
// @route   PATCH /api/admin/forum/:id
const moderatePost = async (req, res) => {
  try {
    const { isPinned, isActive } = req.body;
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $set: { isPinned, isActive } },
      { new: true }
    );
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getStats, getAllBooks, createBook, updateBook, deleteBook,
  getAllRentals, updateRentalStatus, getAllUsers, updateUser,
  getAdminForum, moderatePost
};
