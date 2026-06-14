const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, addComment, toggleLike } = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', protect, createPost);
router.post('/:id/comment', protect, addComment);
router.patch('/:id/like', protect, toggleLike);

module.exports = router;
