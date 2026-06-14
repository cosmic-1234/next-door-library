const express = require('express');
const router = express.Router();
const { getActiveHubs, applyForHub, getMyHub } = require('../controllers/hubController');
const { protect } = require('../middleware/auth');

router.get('/', getActiveHubs);
router.post('/', protect, applyForHub);
router.get('/my', protect, getMyHub);

module.exports = router;
