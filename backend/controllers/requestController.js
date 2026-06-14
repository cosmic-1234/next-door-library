const BookRequest = require('../models/BookRequest');

// @desc    Get all book requests
// @route   GET /api/requests
const getBookRequests = async (req, res) => {
  try {
    const requests = await BookRequest.find()
      .populate('suggestedBy', 'name avatar')
      .populate('fulfilledBy', 'name')
      .sort('-createdAt');
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a book request
// @route   POST /api/requests
const createBookRequest = async (req, res) => {
  try {
    const { title, author, notes } = req.body;
    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Title and Author are required' });
    }

    const request = new BookRequest({
      title,
      author,
      notes,
      suggestedBy: req.user._id
    });

    await request.save();
    
    const populated = await BookRequest.findById(request._id).populate('suggestedBy', 'name avatar');

    res.status(201).json({ success: true, request: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Fulfill a book request (offer to donate/lend)
// @route   POST /api/requests/:id/fulfill
const fulfillBookRequest = async (req, res) => {
  try {
    const request = await BookRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Book request not found' });
    }

    if (request.status === 'fulfilled') {
      return res.status(400).json({ success: false, message: 'This request is already fulfilled' });
    }

    request.status = 'fulfilled';
    request.fulfilledBy = req.user._id;
    await request.save();

    const populated = await BookRequest.findById(request._id)
      .populate('suggestedBy', 'name avatar')
      .populate('fulfilledBy', 'name');

    res.json({ success: true, request: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getBookRequests, createBookRequest, fulfillBookRequest };
