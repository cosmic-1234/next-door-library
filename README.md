# Next Door Library 🌳

A community book lending platform for Nagpur — MERN Stack

## Project Structure

```
next_door_library/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite UI
├── Dockerfile        # Cloud Run deployment
└── README.md
```

## Quick Start (Local Development)

### 1. Setup Backend

```bash
cd backend
cp .env.example .env
# Fill in your MongoDB Atlas URI and JWT secret
npm install
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at http://localhost:5173 and proxies API calls to http://localhost:5000

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/next_door_library
JWT_SECRET=your_secret_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Create First Admin User

1. Register a user through the website at /register
2. Manually update the user's role in MongoDB Atlas:
   - Find the user document
   - Set `role: "admin"`
3. Log in — you'll have access to /admin

## Deploy to Cloud Run

```bash
cd next_door_library

# Set your MongoDB URI first in Cloud Run environment
gcloud run deploy next-door-library \
  --source . \
  --region=asia-south1 \
  --allow-unauthenticated \
  --set-env-vars="MONGO_URI=<your-uri>,JWT_SECRET=<your-secret>"
```

## Features

### User Features
- 🔍 Browse & search book catalogue
- 📚 Request to rent (₹15–30/week)
- 🏠 Home delivery or pickup in Nagpur
- ⭐ Leave reviews and ratings
- ❤️ Wishlist
- 📖 Reading history & dashboard
- 💬 Community forum
- 👥 See what friends are reading

### Admin Features
- 📊 Dashboard with stats & charts
- ➕ Add/Edit/Delete books with cover upload
- 📋 Manage all rental requests
- ✅ Approve/reject/mark returned
- 👤 User management (role, activate/deactivate)
- 📌 Forum moderation
