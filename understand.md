# Next Door Library 🌳 - Functional Documentation

Welcome to **Next Door Library**, a community-driven book lending and reading platform tailored for the citizens of Nagpur. This document provides a complete functional spec and system overview, detailing the application's domain model, main workflows, data structures, features, and technical endpoints.

---

## Table of Contents
1. [Architecture & Technology Stack](#1-architecture--technology-stack)
2. [Domain Entities & Database Schema](#2-domain-entities--database-schema)
3. [Core Functional Workflows](#3-core-functional-workflows)
4. [User Features & Capabilities](#4-user-features--capabilities)
5. [Admin Features & Moderation](#5-admin-features--moderation)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Frontend Routing Reference](#7-frontend-routing-reference)

---

## 1. Architecture & Technology Stack

The application is built using the **MERN** stack:
*   **Database**: MongoDB (object modeling via Mongoose)
*   **Backend**: Node.js & Express.js (REST API, JWT Authentication, Multer for file uploads)
*   **Frontend**: React & Vite (Tailwind / custom CSS styling, Axios client, React Router for client-side routing)
*   **Deployment**: Support for Docker and Google Cloud Run deployment

```
next_door_library/
├── backend/          # Node.js + Express API
│   ├── config/       # Database connections
│   ├── controllers/  # Route handlers (business logic)
│   ├── middleware/   # Auth and upload middleware
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API endpoints definition
│   └── server.js     # Express server entry point
├── frontend/         # React + Vite UI
│   ├── src/
│   │   ├── api/      # Axios wrapper with interceptors
│   │   ├── components/ # Reusable UI components
│   │   ├── context/  # React Auth context
│   │   └── pages/    # Application screens and admin panels
```

---

## 2. Domain Entities & Database Schema

The platform's database contains 7 main collections defined in [backend/models](file:///c:/Users/shrir/Downloads/next_door_library/backend/models):

### 2.1 User ([User.js](file:///c:/Users/shrir/Downloads/next_door_library/backend/models/User.js))
Represents registered readers and system administrators.
*   **Credentials**: Name, email (unique), password (hashed with bcrypt), avatar cover path.
*   **Role**: `user` (default) or `admin`.
*   **Contact Info**: Phone number, physical address (area, city default: "Nagpur", pincode).
*   **Preferences**: `preferDelivery` (boolean flag).
*   **Reading State**:
    *   `currentlyReading`: Reference to the [Book](file:///c:/Users/shrir/Downloads/next_door_library/backend/models/Book.js) currently rented/read.
    *   `readingHistory`: Array of [Book](file:///c:/Users/shrir/Downloads/next_door_library/backend/models/Book.js) references.
    *   `wishlist`: Array of wishlisted [Book](file:///c:/Users/shrir/Downloads/next_door_library/backend/models/Book.js) references.
*   **Social**: `following` and `followers` self-references to other Users.
*   **Reading Challenge**: `readingChallengeYear` (default current year), `readingChallengeGoal` (integer), and `totalBooksRead`.

### 2.2 Book ([Book.js](file:///c:/Users/shrir/Downloads/next_door_library/backend/models/Book.js))
The catalogue of books available for renting.
*   **Metadata**: Title, author, description (up to 2000 chars), cover image URL, ISBN, publisher, publishedYear, pages, language (enum: `English`, `Hindi`, `Marathi`, `Other`).
*   **Classification**: Genre (enum: `Fiction`, `Non-Fiction`, `Mystery`, `Romance`, `Fantasy`, `Science Fiction`, `Biography`, `Self-Help`, `History`, `Children`, `Young Adult`, `Thriller`, `Literary Fiction`, `Philosophy`, `Psychology`, `Business`, `Poetry`, `Other`), tags (array of strings).
*   **Availability**: `condition` (enum: `New`, `Good`, `Fair`), `totalCopies`, `availableCopies` (virtual `isAvailable` if `availableCopies > 0`).
*   **Pricing**: `pricePerWeek` (₹10 to ₹100 weekly rate).
*   **Engagement**: `averageRating` (0–5), `totalRatings`, `totalRentals`, `featured` (boolean status for home screen), `isActive` (boolean for soft deletes).

### 2.3 Rental ([Rental.js](file:///c:/Users/shrir/Downloads/next_door_library/backend/models/Rental.js))
Records transactions of renting a book.
*   **Links**: User reference, Book reference.
*   **Logistics**: `weeksDuration` (1–8 weeks), `totalCost` (`pricePerWeek` * weeks), `deliveryType` (`pickup` or `delivery`), `deliveryAddress` (area & pincode).
*   **Status**: Enum: `pending` (requested), `approved` (approved by admin), `active` (on loan), `returned` (restored to system), `overdue` (past due date), `cancelled`.
*   **Dates**: `requestedAt`, `rentedAt` (loan start), `dueDate` (calculated from weeks duration), `returnedAt`.
*   **Virtuals**: `daysRemaining` (days until due date), `isOverdue` (boolean).

### 2.4 Review ([Review.js](file:///c:/Users/shrir/Downloads/next_door_library/backend/models/Review.js))
Enables book feedback and scoring.
*   **Constraint**: Unique index on `{ user, book }` restricts users to one review per book.
*   **Feedback**: `rating` (1–5 scale), title, body (up to 1000 chars), `hasSpoilers` (boolean flag), `likes` (array of User references).

### 2.5 Collection Hub ([Hub.js](file:///c:/Users/shrir/Downloads/next_door_library/backend/models/Hub.js))
Decentralized pickup locations in Nagpur.
*   **Host**: Host user reference.
*   **Location**: Area (enum: `Dharampeth`, `Sitabuldi`, `Gandhibagh`, `Sadar`, `Civil Lines`, `Ramdaspeth`, `Bajaj Nagar`, `Manewada`, `Road`, `Amravati Road`, `Hingna`, `Katol Road`, `Other`), full address, description.
*   **Status**: Enum: `pending` (awaiting admin approval), `active`, `inactive`.

### 2.6 Book Request / Suggestion ([BookRequest.js](file:///c:/Users/shrir/Downloads/next_door_library/backend/models/BookRequest.js))
Allows users to request books they want added to the library.
*   **Information**: Title, author, custom request notes.
*   **State**: Suggested by (User), fulfilled by (User - dynamic peer contribution), status (enum: `pending`, `fulfilled`, `cancelled`).

### 2.7 Forum Post ([ForumPost.js](file:///c:/Users/shrir/Downloads/next_door_library/backend/models/ForumPost.js))
Community interaction structure.
*   **Details**: Title, body (up to 5000 chars), author (User), book reference (optional link), category (enum: `Discussion`, `Recommendation`, `Review`, `Question`, `General`), tags.
*   **Likes & Moderation**: Likes array, `isPinned`, `isActive` (moderator visibility toggling), views counter.
*   **Comments**: Nested schema array containing comment author, body text, likes, and timestamps.

---

## 3. Core Functional Workflows

### 3.1 Book Rental Lifecycle
The rental workflow coordinates copies allocation, user current-reading state, and returns:

```
                  [User requests rental (Weeks: 1-8)]
                                  │
                                  ▼
                        Status: "pending"
                                  │
                       (Admin approves request)
                                  │
                                  ▼
                        Status: "active"
             * Book's availableCopies decremented by 1
             * User's currentlyReading set to this Book
             * rentedAt & dueDate set automatically
                                  │
            ┌─────────────────────┴─────────────────────┐
   (Return date arrives)                       (User requests return)
            │                                           │
            ▼                                           ▼
   Status: "overdue"                           Status: "returned"
 (if due date passes without action)        * Book's availableCopies incremented by 1
                                            * Book appended to User's readingHistory
                                            * User's totalBooksRead incremented
                                            * User's currentlyReading cleared
```

### 3.2 Collection Hub Registration
1.  Any registered User can apply to convert their address into a neighborhood collection hub.
2.  Application is sent with location specifics, Nagpur area, and phone number.
3.  The request goes into a `pending` state.
4.  Admin reviews the hub application under User Management or DB level.
5.  Once approved, status updates to `active`, and the hub appears on the public `/hubs` directory so that renting users can choose it as a pick-up destination.

### 3.3 Book Suggestion & Peer Fulfillment
1.  Users visit `/suggestions` and submit suggestions for books they want to read.
2.  If another user has the requested book, they can click "Fulfill" to volunteer to donate or lend it to the library.
3.  The request status updates to `fulfilled` and displays the name of the peer who offered to supply it.

---

## 4. User Features & Capabilities

### 4.1 Browse, Search & Filter Catalogue
*   Full-text search querying book titles, authors, descriptions, or tags.
*   Multi-parameter filter (Genre, Language, Condition, Price per week range, Availability).
*   Sorting options: Date added (default), average rating, price (low-to-high / high-to-low), popularity (total rentals count), and alphabetical title.

### 4.2 Dashboard & Reading Goals
*   **Active Loans Tracking**: Displays current rentals, time remaining, total costs, and status.
*   **Reading Statistics**: Yearly reading progress bar showing actual books read vs. the customizable Annual Reading Challenge goal.
*   **Quick Links**: Shows currently reading book, wishlist bookmarks, and absolute reading history.
*   **Profile Editor**: Change avatars (file upload), address details, Nagpur residential area, phone number, and delivery preference.

### 4.3 Social Connections & Feed
*   Search for other registered members by name or email.
*   Follow/Unfollow user system.
*   **Friends Feed**: Dedicated social timeline showing what books followed friends are currently reading, encouraging community updates.

### 4.4 Community Forums
*   Create topics linked to specific books or general categories.
*   Like posts and write nested replies.
*   Filter forum boards by categories (e.g. Recommendations, Questions).

---

## 5. Admin Features & Moderation

Admins access a protected workspace at `/admin` offering the following panels:

*   **KPI Statistics Dashboard**:
    *   Top stats cards: Total active books, registered active users, total rentals, and breakdown of active, pending, and overdue loans.
    *   Financial status: Total revenue generated from completed rentals.
    *   Monthly trends graph: Displays rental activity and revenue trends over the past 6 months.
    *   Genre popularity chart: Analyzes the top rented book categories in the system.
*   **Catalogue Management (`/admin/books`)**:
    *   Create books with multipart/form-data cover image uploads.
    *   Modify details of existing books.
    *   Soft-delete books (marks `isActive: false`, excluding them from search catalogues but keeping integrity for past rentals).
*   **Rentals Control Room (`/admin/rentals`)**:
    *   List all requests filtered by statuses (pending, approved, active, returned, cancelled).
    *   Process actions: Approve loan (transition to `active`), log returns, or write administrative notes.
*   **User Registry (`/admin/users`)**:
    *   Search and manage accounts.
    *   Ban or reactivate users (`isActive: true/false`).
    *   Promote users to administrators (`role: "admin"`).
*   **Forum Moderation**:
    *   Pin posts to the top of boards.
    *   Hide offensive or off-topic posts.

---

## 6. API Endpoints Reference

All routes require authentication headers (`Authorization: Bearer <token>`) unless marked public.

| Endpoint | Method | Authentication | Description |
| :--- | :---: | :---: | :--- |
| **Authentication** | | | |
| `/api/auth/register` | POST | Public | Register new account; returns JWT token + user payload |
| `/api/auth/login` | POST | Public | Sign in user; returns JWT token + user payload |
| `/api/auth/me` | GET | Protected | Retrieves authenticated user context (mount verification) |
| **Catalogue** | | | |
| `/api/books` | GET | Public | Fetch books with search, filters, pagination |
| `/api/books/featured` | GET | Public | Fetch 8 featured books for Home slider |
| `/api/books/:id` | GET | Public | Fetch detailed book info, dynamic reviews, and 4 related books |
| `/api/books/:id/reviews` | POST | Protected | Submit a rating (1-5) and feedback for a book |
| `/api/books/:id/wishlist`| POST | Protected | Toggle inclusion of the book in the user's wishlist |
| **Rentals** | | | |
| `/api/rentals` | POST | Protected | File a new rental request |
| `/api/rentals/my` | GET | Protected | Get rentals associated with the current user |
| `/api/rentals/:id/return-request` | PATCH | Protected | User signals return of book (updates stats, increment copies) |
| **Users & Social** | | | |
| `/api/users/search` | GET | Protected | Search registered users by name or email query |
| `/api/users/feed` | GET | Protected | Fetch feed containing books currently read by followed users |
| `/api/users/me` | PATCH | Protected | Update profile metadata (supports avatar file upload) |
| `/api/users/me/challenge`| PATCH | Protected | Update annual reading goal count |
| `/api/users/follow/:id` | POST | Protected | Follow/unfollow target user |
| `/api/users/:id` | GET | Public | Fetch public user profile, followers, and reading logs |
| **Community Hubs** | | | |
| `/api/hubs` | GET | Public | Fetch active collection and delivery hubs |
| `/api/hubs` | POST | Protected | Apply to establish a neighborhood pickup hub |
| `/api/hubs/my` | GET | Protected | Get status of hub hosted by the current user |
| **Suggestions** | | | |
| `/api/requests` | GET | Public | Get listing of recommended books |
| `/api/requests` | POST | Protected | Suggest a book for the community library |
| `/api/requests/:id/fulfill`| POST | Protected | Fulfill a book request (volunteer to supply it) |
| **Community Forum** | | | |
| `/api/forum` | GET | Public | Fetch forum posts list |
| `/api/forum/:id` | GET | Public | Fetch detailed forum post + comments |
| `/api/forum` | POST | Protected | Publish a new discussion post |
| `/api/forum/:id/comment` | POST | Protected | Reply to a forum post |
| `/api/forum/:id/like` | PATCH | Protected | Toggle post like |
| **Administration** (Admin Access Required) | | | |
| `/api/admin/stats` | GET | Admin | Retrieve aggregate KPIs, revenues, and charts data |
| `/api/admin/books` | GET | Admin | List all books (including inactive) |
| `/api/admin/books` | POST | Admin | Insert new book with cover image upload |
| `/api/admin/books/:id` | PATCH | Admin | Edit book parameters and properties |
| `/api/admin/books/:id` | DELETE| Admin | Soft-delete a book |
| `/api/admin/rentals` | GET | Admin | Retrieve all loans across the platform |
| `/api/admin/rentals/:id` | PATCH | Admin | Approve rental, record returns, log cancellation |
| `/api/admin/users` | GET | Admin | Retrieve complete list of users |
| `/api/admin/users/:id` | PATCH | Admin | Update user activation status or roles |
| `/api/admin/forum` | GET | Admin | Get all forum posts |
| `/api/admin/forum/:id` | PATCH | Admin | Pin/unpin or delete a forum post |

---

## 7. Frontend Routing Reference

Client routing is handled via `react-router-dom` in [frontend/src/App.jsx](file:///c:/Users/shrir/Downloads/next_door_library/frontend/src/App.jsx) and supports three access scopes:

### 7.1 Public Routes (Available to all visitors)
*   `/` : Home page featuring a banner search, book carousel, and community stats.
*   `/books` : Catalogue browser with comprehensive filter sidebar and sorting.
*   `/books/:id` : Book detail, ratings, reviews lists, and related titles.
*   `/forum` : Public discussion boards.
*   `/suggestions` : List of suggestions.
*   `/hubs` : Map/List directory of active neighborhood collection points.

### 7.2 Auth Gates (Redirects to `/dashboard` if user is logged in)
*   `/login` : Account authentication.
*   `/register` : Create account with profile details.

### 7.3 Protected Routes (Redirects to `/login` if not authenticated)
*   `/dashboard` : User control panel (active rentals, wishlist, challenge progress, profile form).
*   `/feed` : Social timeline showing friends' reading activities.

### 7.4 Admin Routes (Requires logged in user with role `admin`)
Inherits a persistent Admin layout and navigation sidebar:
*   `/admin` : Dashboard summarizing key charts and library metrics.
*   `/admin/books` : Inventory catalogue table with add/edit drawer tools.
*   `/admin/rentals` : Rental loan queue processor.
*   `/admin/users` : Customer account management panel.
