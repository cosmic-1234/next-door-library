const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables explicitly from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();

// CORS — allow localhost dev + any Cloud Run URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.run.app') || 
      origin.endsWith('.onrender.com') || 
      origin.endsWith('nextdoorlibrary.in')
    ) {
      cb(null, true);
    } else {
      cb(new Error('CORS not allowed'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/rentals', require('./routes/rentals'));
app.use('/api/users', require('./routes/users'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/hubs', require('./routes/hubs'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Next Door Library API is running' }));

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  // Works whether server is run from /backend or from project root
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  // All non-API routes → React app (client-side routing)
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌳 Next Door Library API running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
