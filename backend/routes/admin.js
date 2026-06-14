const express = require('express');
const router = express.Router();
const {
  getStats, getAllBooks, createBook, updateBook, deleteBook,
  getAllRentals, updateRentalStatus, getAllUsers, updateUser,
  getAdminForum, moderatePost
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

// Apply both protect + adminAuth to all admin routes
router.use(protect, adminAuth);

router.get('/stats', getStats);

router.get('/books', getAllBooks);
router.post('/books', upload.single('cover'), createBook);
router.patch('/books/:id', upload.single('cover'), updateBook);
router.delete('/books/:id', deleteBook);

router.get('/rentals', getAllRentals);
router.patch('/rentals/:id', updateRentalStatus);

router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);

router.get('/forum', getAdminForum);
router.patch('/forum/:id', moderatePost);

module.exports = router;
