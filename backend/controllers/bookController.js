const Book = require('../models/Book');
const Review = require('../models/Review');

// @desc    Get all books (with filters, search, pagination)
// @route   GET /api/books
const getBooks = async (req, res) => {
  try {
    const {
      search, genre, language, condition, available,
      minPrice, maxPrice, sort, page = 1, limit = 12
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (genre) query.genre = genre;
    if (language) query.language = language;
    if (condition) query.condition = condition;
    if (available === 'true') query.availableCopies = { $gt: 0 };
    if (minPrice || maxPrice) {
      query.pricePerWeek = {};
      if (minPrice) query.pricePerWeek.$gte = Number(minPrice);
      if (maxPrice) query.pricePerWeek.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'price_asc') sortOption = { pricePerWeek: 1 };
    if (sort === 'price_desc') sortOption = { pricePerWeek: -1 };
    if (sort === 'popular') sortOption = { totalRentals: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query).sort(sortOption).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      books,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get featured books
// @route   GET /api/books/featured
const getFeaturedBooks = async (req, res) => {
  try {
    const books = await Book.find({ featured: true, isActive: true }).limit(8);
    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const reviews = await Review.find({ book: book._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Get related books by genre
    const related = await Book.find({
      genre: book.genre,
      _id: { $ne: book._id },
      isActive: true
    }).limit(4);

    res.json({ success: true, book, reviews, related });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add review to book
// @route   POST /api/books/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, title, body, hasSpoilers } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const existingReview = await Review.findOne({ user: req.user._id, book: book._id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this book' });
    }

    const review = await Review.create({
      user: req.user._id,
      book: book._id,
      rating,
      title,
      body,
      hasSpoilers: hasSpoilers || false
    });

    // Update book average rating
    const allReviews = await Review.find({ book: book._id });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    await Book.findByIdAndUpdate(book._id, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: allReviews.length
    });

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this book' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle wishlist
// @route   POST /api/books/:id/wishlist
const toggleWishlist = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const bookId = req.params.id;

    const isWishlisted = user.wishlist.includes(bookId);
    if (isWishlisted) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== bookId);
    } else {
      user.wishlist.push(bookId);
    }
    await user.save();

    res.json({ success: true, wishlisted: !isWishlisted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getBooks, getFeaturedBooks, getBook, addReview, toggleWishlist };
