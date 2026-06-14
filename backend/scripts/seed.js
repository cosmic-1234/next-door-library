const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Book = require('../models/Book');
const Rental = require('../models/Rental');
const ForumPost = require('../models/ForumPost');
const Review = require('../models/Review');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const booksData = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    description: "An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.",
    cover: "https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg",
    genre: "Fantasy",
    language: "English",
    isbn: "9780439708180",
    publisher: "Scholastic",
    publishedYear: 1997,
    pages: 309,
    condition: "New",
    pricePerWeek: 20,
    totalCopies: 3,
    availableCopies: 3,
    featured: true,
    tags: ["magic", "wizard", "hogwarts", "adventure", "classic"]
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "A reluctant Hobbit, Bilbo Baggins, is set off on a journey to reclaim the stolen treasure of the Dwarves from the dragon Smaug.",
    cover: "https://covers.openlibrary.org/b/isbn/9780261102217-L.jpg",
    genre: "Fantasy",
    language: "English",
    isbn: "9780261102217",
    publisher: "HarperCollins",
    publishedYear: 1937,
    pages: 310,
    condition: "Good",
    pricePerWeek: 20,
    totalCopies: 2,
    availableCopies: 2,
    featured: true,
    tags: ["middle-earth", "adventure", "dwarves", "dragon", "quest"]
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    genre: "Self-Help",
    language: "English",
    isbn: "9780735211292",
    publisher: "Avery",
    publishedYear: 2018,
    pages: 320,
    condition: "New",
    pricePerWeek: 25,
    totalCopies: 4,
    availableCopies: 4,
    featured: true,
    tags: ["habits", "productivity", "growth", "psychology", "focus"]
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. To Kill a Mockingbird became both an instant bestseller and a critical success when it was first published in 1960.",
    cover: "https://covers.openlibrary.org/b/isbn/9780446310789-L.jpg",
    genre: "Fiction",
    language: "English",
    isbn: "9780446310789",
    publisher: "Grand Central Publishing",
    publishedYear: 1960,
    pages: 281,
    condition: "Good",
    pricePerWeek: 15,
    totalCopies: 2,
    availableCopies: 2,
    featured: false,
    tags: ["justice", "classic", "racism", "society", "growing up"]
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different—and far more satisfying—than he ever imagined.",
    cover: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
    genre: "Philosophy",
    language: "English",
    isbn: "9780062315007",
    publisher: "HarperOne",
    publishedYear: 1988,
    pages: 167,
    condition: "Good",
    pricePerWeek: 15,
    totalCopies: 3,
    availableCopies: 3,
    featured: false,
    tags: ["dreams", "destiny", "inspiration", "journey", "classic"]
  },
  {
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    description: "This book contains money-making secrets that can change your life. Think and Grow Rich is Napoleon Hill's most popular book, conveying the experience of more than 500 men of great wealth, who began from scratch, with nothing to give in return for riches except thoughts, ideas and organized plans.",
    cover: "https://covers.openlibrary.org/b/isbn/9781593302009-L.jpg",
    genre: "Business",
    language: "English",
    isbn: "9781593302009",
    publisher: "Philosopher's Press",
    publishedYear: 1937,
    pages: 238,
    condition: "Fair",
    pricePerWeek: 15,
    totalCopies: 1,
    availableCopies: 1,
    featured: false,
    tags: ["wealth", "mindset", "success", "motivation", "finance"]
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description: "100,000 years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens. How did our species succeed in the battle for dominance? Why did our foraging ancestors come together to create cities and kingdoms? How did we come to believe in gods, nations and human rights; to trust money, books and laws; and to be enslaved by bureaucracy, consumerism and timetable chase?",
    cover: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    genre: "History",
    language: "English",
    isbn: "9780062316097",
    publisher: "Harper",
    publishedYear: 2011,
    pages: 498,
    condition: "New",
    pricePerWeek: 30,
    totalCopies: 2,
    availableCopies: 2,
    featured: true,
    tags: ["history", "science", "humanity", "evolution", "society"]
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with large windows overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
    cover: "https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg",
    genre: "Thriller",
    language: "English",
    isbn: "9781250301697",
    publisher: "Celadon Books",
    publishedYear: 2019,
    pages: 336,
    condition: "Good",
    pricePerWeek: 25,
    totalCopies: 2,
    availableCopies: 2,
    featured: false,
    tags: ["mystery", "psychological", "murder", "suspense", "therapy"]
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    description: "Robert Kiyosaki's book explodes the myth that you need to earn a high income to become rich and challenges the belief that your house is an asset. It shows parents why they can't rely on the school system to teach their kids about money and defines once and for all what is an asset and what is a liability.",
    cover: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg",
    genre: "Business",
    language: "English",
    isbn: "9781612680194",
    publisher: "Plata Publishing",
    publishedYear: 1997,
    pages: 336,
    condition: "Good",
    pricePerWeek: 20,
    totalCopies: 3,
    availableCopies: 3,
    featured: true,
    tags: ["finance", "investing", "money", "education", "wealth"]
  },
  {
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    description: "A pilot stranded in the desert awakes one morning to see a most extraordinary little fellow standing before him, asking him to draw a sheep. And the pilot realizes that when life's events are too difficult to understand, there is no choice but to succumb to their mysteries. He pulls out a piece of paper and a pen...",
    cover: "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg",
    genre: "Children",
    language: "English",
    isbn: "9780156012195",
    publisher: "Harcourt",
    publishedYear: 1943,
    pages: 96,
    condition: "Good",
    pricePerWeek: 15,
    totalCopies: 5,
    availableCopies: 5,
    featured: false,
    tags: ["children", "classic", "imagination", "philosophy", "friendship"]
  }
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }

    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing old data (Books, Users, Rentals, ForumPosts, Reviews)...');
    await Book.deleteMany({});
    await User.deleteMany({});
    await Rental.deleteMany({});
    await ForumPost.deleteMany({});
    await Review.deleteMany({});
    console.log('Data cleared.');

    // 1. Create Nagpur Admin User
    console.log('Creating admin user...');
    const adminUser = new User({
      name: "Nagpur Admin",
      email: "admin@nextdoorlibrary.com",
      password: "adminpassword123", // Will be hashed automatically by userSchema pre-save
      role: "admin",
      phone: "9876543210",
      address: {
        area: "Dharampeth",
        city: "Nagpur",
        pincode: "440010"
      },
      preferDelivery: true,
      bio: "Founder of Next Door Library. Passionate about reading, emulsifying books back into the community, and providing affordable access to children."
    });
    await adminUser.save();
    console.log(`Admin user created: ${adminUser.email} / adminpassword123`);

    // 2. Create Normal User
    console.log('Creating standard test user...');
    const testUser = new User({
      name: "Rohan Sharma",
      email: "rohan@gmail.com",
      password: "password123", // Will be hashed automatically by userSchema pre-save
      role: "user",
      phone: "9823456789",
      address: {
        area: "Sardar",
        city: "Nagpur",
        pincode: "440001"
      },
      preferDelivery: false,
      bio: "Avid fiction reader and university student. Looking for classic literature and fantasy titles."
    });
    await testUser.save();
    console.log(`Test user created: ${testUser.email} / password123`);

    // Follow each other
    adminUser.followers.push(testUser._id);
    adminUser.following.push(testUser._id);
    testUser.followers.push(adminUser._id);
    testUser.following.push(adminUser._id);
    await adminUser.save();
    await testUser.save();

    // 3. Create Books with adminUser as addedBy
    console.log('Inserting books...');
    const booksToInsert = booksData.map(book => ({
      ...book,
      addedBy: adminUser._id
    }));
    const insertedBooks = await Book.insertMany(booksToInsert);
    console.log(`Successfully seeded ${insertedBooks.length} books with high-res cover image URLs!`);

    // 4. Create one dummy forum post
    console.log('Creating a sample forum post...');
    const post = new ForumPost({
      title: "Welcome to Next Door Library! 🌳",
      body: "Hello book lovers of Nagpur! I started this library to make reading affordable and accessible for everyone. Kids, parents, homemakers—anyone can rent these books for cheap. Let me know what books you'd like to see next!",
      author: adminUser._id,
      category: "General",
      tags: ["announcement", "welcome", "nagpur"]
    });
    await post.save();
    console.log('Sample forum post created.');

    console.log('Database seeding completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
