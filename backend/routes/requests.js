const express = require('express');
const router = express.Router();
const { getBookRequests, createBookRequest, fulfillBookRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.get('/', getBookRequests);
router.post('/', protect, createBookRequest);
router.post('/:id/fulfill', protect, fulfillBookRequest);

module.exports = router;
