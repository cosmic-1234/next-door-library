const Hub = require('../models/Hub');

// @desc    Get all active collection hubs
// @route   GET /api/hubs
const getActiveHubs = async (req, res) => {
  try {
    const hubs = await Hub.find({ status: 'active' })
      .populate('hostUser', 'name avatar bio')
      .sort('-createdAt');
    res.json({ success: true, hubs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Apply to host a hub
// @route   POST /api/hubs
const applyForHub = async (req, res) => {
  try {
    const { area, address, contactPhone, description } = req.body;
    if (!area || !address || !contactPhone) {
      return res.status(400).json({ success: false, message: 'Area, Address, and Contact Phone are required' });
    }

    // Check if user already has a hub application
    const existing = await Hub.findOne({ hostUser: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a hub application' });
    }

    const hub = new Hub({
      hostUser: req.user._id,
      area,
      address,
      contactPhone,
      description,
      status: 'pending' // Admin must approve
    });

    await hub.save();
    res.status(201).json({ success: true, hub });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get my hosted hub status
// @route   GET /api/hubs/my
const getMyHub = async (req, res) => {
  try {
    const hub = await Hub.findOne({ hostUser: req.user._id });
    res.json({ success: true, hub });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getActiveHubs, applyForHub, getMyHub };
