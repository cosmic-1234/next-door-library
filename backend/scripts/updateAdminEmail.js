const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const connectDB = require('../config/db');

async function run() {
  try {
    await connectDB();
    console.log('Connected to database.');

    const result = await User.updateOne(
      { email: 'admin@nextdoorlibrary.com' },
      { $set: { email: 'admin@nextdoorlibrary.in' } }
    );

    if (result.matchedCount > 0) {
      console.log('Successfully updated admin email to admin@nextdoorlibrary.in');
    } else {
      console.log('No user found with email admin@nextdoorlibrary.com (it may already be updated or not seeded yet).');
    }
  } catch (error) {
    console.error('Error running update script:', error);
  } finally {
    mongoose.connection.close();
  }
}

run();
