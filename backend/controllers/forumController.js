const ForumPost = require('../models/ForumPost');

// @desc    Get all forum posts
// @route   GET /api/forum
const getPosts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ForumPost.countDocuments(query);

    const posts = await ForumPost.find(query)
      .populate('author', 'name avatar')
      .populate('book', 'title author cover')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      posts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single post
// @route   GET /api/forum/:id
const getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('book', 'title author cover')
      .populate('comments.author', 'name avatar');

    if (!post || !post.isActive) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.views += 1;
    await post.save();

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create forum post
// @route   POST /api/forum
const createPost = async (req, res) => {
  try {
    const { title, body, category, bookId, tags } = req.body;

    const post = await ForumPost.create({
      title,
      body,
      category: category || 'Discussion',
      book: bookId || null,
      tags: tags || [],
      author: req.user._id
    });

    await post.populate('author', 'name avatar');
    await post.populate('book', 'title author cover');

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add comment to post
// @route   POST /api/forum/:id/comment
const addComment = async (req, res) => {
  try {
    const { body } = req.body;
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({ author: req.user._id, body });
    await post.save();
    await post.populate('comments.author', 'name avatar');

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Like/Unlike post
// @route   PATCH /api/forum/:id/like
const toggleLike = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();

    res.json({ success: true, liked: !isLiked, likeCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getPosts, getPost, createPost, addComment, toggleLike };
