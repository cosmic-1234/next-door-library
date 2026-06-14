const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, toggleFollow, getFriendsFeed, searchUsers, updateReadingChallenge } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/feed', protect, getFriendsFeed);
router.get('/search', protect, searchUsers);
router.patch('/me', protect, upload.single('avatar'), updateProfile);
router.patch('/me/challenge', protect, updateReadingChallenge);
router.post('/follow/:id', protect, toggleFollow);
router.get('/:id', getUserProfile);

module.exports = router;
