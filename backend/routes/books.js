const express = require('express');
const router = express.Router();
const { getBooks, getFeaturedBooks, getBook, addReview, toggleWishlist } = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

router.get('/', getBooks);
router.get('/featured', getFeaturedBooks);
router.get('/:id', getBook);
router.post('/:id/reviews', protect, addReview);
router.post('/:id/wishlist', protect, toggleWishlist);

module.exports = router;
