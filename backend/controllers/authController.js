const jwt = require('jsonwebtoken');
const Mailjet = require('node-mailjet');
const User = require('../models/User');

let mailjet = null;
if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
  mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET
  );
}

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const otpStore = {};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, acquisitionSource, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (!otp) {
      return res.status(400).json({ success: false, message: 'Please provide email verification OTP' });
    }

    const emailKey = email.toLowerCase();
    const activeOtp = otpStore[emailKey];

    if (!activeOtp || activeOtp.expires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please send a new one.' });
    }

    if (activeOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please check your verification code.' });
    }

    // OTP is valid, clear it
    delete otpStore[emailKey];

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      phone,
      acquisitionSource: acquisitionSource || 'organic',
      lifecycleStage: 'lead'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        preferDelivery: user.preferDelivery
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('currentlyReading', 'title author cover')
      .populate('readingHistory', 'title author cover')
      .populate('wishlist', 'title author cover pricePerWeek');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in-memory with 5-minute expiration
    otpStore[email.toLowerCase()] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    console.log(`\n======================================================`);
    console.log(`[OTP] Verification code for ${email}: ${otp}`);
    console.log(`======================================================\n`);

    const fromEmail = process.env.MAILJET_FROM_EMAIL || 'admin@nextdoorlibrary.in';
    const hasKeys = !!(process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET && mailjet);
    let mailjetError = null;

    if (hasKeys) {
      try {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@400;500;700&display=swap');
    
    body {
      background-color: #EDE0C8;
      font-family: 'DM Sans', Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #FFF8EE;
      border: 1px solid #C4906A;
      border-radius: 12px;
      padding: 40px 30px;
      box-shadow: 0 4px 20px rgba(59, 35, 20, 0.15);
      animation: fadeIn 0.8s ease-out;
    }
    
    .logo-section {
      text-align: center;
      margin-bottom: 30px;
      animation: float 3s ease-in-out infinite;
    }
    
    .logo-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 32px;
      color: #3B2314;
      font-weight: 700;
      margin: 0;
      letter-spacing: 0.02em;
    }
    
    .logo-subtitle {
      font-size: 10px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #C4906A;
      margin-top: 4px;
      font-weight: bold;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #C4906A, transparent);
      margin: 20px 0;
    }
    
    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      color: #3B2314;
      font-size: 24px;
      text-align: center;
      margin-top: 0;
    }
    
    p {
      color: #6B4C3B;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    .otp-box {
      background-color: #FBF7F0;
      border: 2px dashed #C4906A;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
      animation: pulse 2s infinite;
    }
    
    .otp-code {
      font-family: 'DM Sans', Arial, monospace;
      font-size: 36px;
      font-weight: bold;
      color: #3B2314;
      letter-spacing: 12px;
      margin: 0;
      padding-left: 12px;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: #9B7B6A;
      border-top: 1px solid #EDE0C8;
      padding-top: 20px;
    }
    
    .footer a {
      color: #C4906A;
      text-decoration: none;
      font-weight: bold;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
      100% { transform: translateY(0px); }
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(196, 144, 106, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(196, 144, 106, 0); }
      100% { box-shadow: 0 0 0 0 rgba(196, 144, 106, 0); }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="logo-section">
      <div class="logo-title">Next Door Library</div>
      <div class="logo-subtitle">Nagpur</div>
    </div>
    <div class="divider"></div>
    <h1>Verify Your Email</h1>
    <p>Hello,</p>
    <p>Thank you for joining <strong>Next Door Library</strong>. To complete your account registration, please enter the 6-digit verification code below on the signup page:</p>
    
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
    </div>
    
    <p style="font-size: 13px; color: #9B7B6A; text-align: center;">This code is valid for 5 minutes. If you did not request this, you can safely ignore this email.</p>
    
    <div class="divider"></div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Next Door Library, Nagpur.</p>
      <p>Need help? Contact us at <a href="mailto:admin@nextdoorlibrary.in">admin@nextdoorlibrary.in</a></p>
    </div>
  </div>
</body>
</html>
`;

        await mailjet
          .post('send', { version: 'v3.1' })
          .request({
            Messages: [
              {
                From: {
                  Email: fromEmail,
                  Name: "Next Door Library"
                },
                To: [
                  {
                    Email: email,
                    Name: "Reader"
                  }
                ],
                Subject: '🔑 Verify your Next Door Library account',
                TextPart: `Your Next Door Library verification code is: ${otp}. This code is valid for 5 minutes.`,
                HTMLPart: htmlContent
              }
            ]
          });

        console.log(`[Mailjet] OTP Email sent successfully to ${email}`);
      } catch (err) {
        console.error('[Mailjet] Error sending email:', err.statusCode || err.message, err.message);
        mailjetError = err.message;
      }
    } else {
      console.log('[Mailjet] WARNING: MAILJET_API_KEY or MAILJET_API_SECRET is not defined. Using local fallback.');
    }

    res.status(200).json({ 
      success: true, 
      message: mailjetError 
        ? `Verification code generated, but email delivery failed (${mailjetError}). Code logged in console.`
        : 'Verification OTP sent successfully!',
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error sending verification code' });
  }
};

module.exports = { register, login, getMe, sendOtp };
