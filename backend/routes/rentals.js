const express = require('express');
const router = express.Router();
const { requestRental, getMyRentals, requestReturn } = require('../controllers/rentalController');
const { protect } = require('../middleware/auth');

router.post('/', protect, requestRental);
router.get('/my', protect, getMyRentals);
router.patch('/:id/return-request', protect, requestReturn);

module.exports = router;
