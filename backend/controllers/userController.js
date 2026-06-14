const User = require('../models/User');
const Book = require('../models/Book');

// @desc    Get user profile
// @route   GET /api/users/:id
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('currentlyReading', 'title author cover')
      .populate('readingHistory', 'title author cover genre')
      .populate('following', 'name avatar currentlyReading')
      .populate('followers', 'name avatar');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update profile
// @route   PATCH /api/users/me
const updateProfile = async (req, res) => {
  try {
    const { name, bio, phone, address, preferDelivery, currentlyReadingId } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (address) updateData.address = address;
    if (preferDelivery !== undefined) updateData.preferDelivery = preferDelivery;
    if (currentlyReadingId !== undefined) {
      updateData.currentlyReading = currentlyReadingId || null;
    }

    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Follow/Unfollow user
// @route   POST /api/users/follow/:id
const toggleFollow = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user._id.toString());
    } else {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ success: true, following: !isFollowing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get friends reading feed
// @route   GET /api/users/feed
const getFriendsFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'following',
      select: 'name avatar bio currentlyReading',
      populate: {
        path: 'currentlyReading',
        select: 'title author cover genre'
      }
    });

    const feed = user.following.filter(f => f.currentlyReading !== null);
    res.json({ success: true, feed });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Search users
// @route   GET /api/users/search
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true,
      _id: { $ne: req.user._id }
    }).select('name avatar bio currentlyReading').limit(10)
      .populate('currentlyReading', 'title author');

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getUserProfile, updateProfile, toggleFollow, getFriendsFeed, searchUsers };
