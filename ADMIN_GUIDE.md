# Next Door Library — Administrator Manual

Welcome to the **Next Door Library** admin guide. This document explains how to access the administration portal and manage the platform's inventory, physical hubs, rentals, members, and support requests.

---

## 1. Accessing the Admin Portal

### Credentials
*   **Admin Sign-in URL**: Navigate to the standard login page at `https://nextdoorlibrary.in/login` (or `/login` on your localhost).
*   **Default Admin Email**: `admin@nextdoorlibrary.in`
*   **Default Admin Password**: `adminpassword123`

*Upon successful login with an administrator account, the system automatically redirects you to the `/admin` dashboard.*

---

## 2. Admin Dashboard Overview
The main admin dashboard provides a quick summary of the platform's current health and operations:
*   **Active Rentals**: Number of books currently out on loan with readers.
*   **Pending Requests**: New checkout requests waiting for your approval.
*   **Total Inventory**: Total number of book titles in the catalogue.
*   **Registered Members**: Total number of readers in the community.
*   **Active Hubs**: Number of physical pickup/drop-off locations.

---

## 3. Inventory & Books Management
Located in the **Books** tab, this is where you control the books catalogue.

### Adding a New Book
1.  Click the **Add Book** button.
2.  Fill in the form fields:
    *   **Title** (Required): The name of the book.
    *   **Author** (Required): The writer's name.
    *   **Genre** (Required): Select from the dropdown genres (Fiction, Non-Fiction, Mystery, Romance, Fantasy, Science Fiction, Biography, Self-Help, History, Children, Young Adult, Thriller, Literary Fiction, Philosophy, Psychology, Business, Poetry, Other).
    *   **Description** (Required): A brief synopsis/blurb of the book.
    *   **Price Per Week (₹)** (Required): Weekly rental price (must be between ₹10 and ₹100).
    *   **Total Copies**: The total quantity of this book owned by the library (must be at least 1).
    *   **Language**: Select the book's language (English, Hindi, Marathi, Other).
    *   **Condition**: Select physical condition (New, Good, Fair).
    *   **Publisher**: Publisher name.
    *   **Published Year**: Year of publication (e.g. 2023).
    *   **Pages**: Number of pages.
    *   **ISBN**: Standard ISBN identifier number.
    *   **Tags**: Comma-separated search words (e.g. `bestseller, emotional, recommended`).
    *   **Cover Image**: Upload an image file (JPEG/PNG) from your computer.
    *   **Mark as Featured**: Toggle the checkbox to feature the book on the main landing page.
3.  Click **Add Book** (or **Update Book** if editing).

### Updating Cover Images
*   **Image Processing**: When you upload an image, the server processes it, stores it in the secure `/uploads/` directory, and saves the relative link in the database.
*   **Tip**: Use standard portrait aspect-ratio images (e.g. 3:4 or 2:3) for a clean visual grid layout.

### Editing & Deleting Books
*   **Editing**: Click the **Edit (pencil icon)** on any book row to modify its details.
*   **Availability Calculation**: The system automatically calculates available stock: `Available = Total Copies - Active Loans`.
*   **Deleting**: Click the **Delete** button to remove a title from the catalog.

---

## 4. Hubs & Pickup Locations Management
To make pickup operations community-oriented, neighbors (such as stay-at-home mothers or book lovers) apply to host pickup/drop-off points.

### Hub Verification & Approval Workflow
1.  **Application**: Users apply to host a neighborhood hub directly through the public `/hubs` page.
2.  **Pending Status**: Newly submitted applications are saved in the database with `status: "pending"`.
3.  **Activation**: There is no direct admin UI panel for hubs in the dashboard. To approve and activate a hub, the administrator must change its `status` field to `"active"` directly in the database (via MongoDB Atlas or using a database query).
4.  **Display**: Once activated (`status: "active"`), the hub is displayed publicly on the `/hubs` page and becomes available for selection by readers during book checkout.

---

## 5. Rentals & Checkout Requests Flow
When a user requests a book, it appears in the **Rentals** tab of the Admin dashboard.

### Status Transitions
You can change a rental status at any time to **any** value using the dropdown selector in the table row:
*   `pending` — Initial request submitted by the reader.
*   `approved` — Request approved.
*   `active` — Book is currently with the reader.
*   `returned` — Book returned to library.
*   `overdue` — Due date passed.
*   `cancelled` — Request cancelled or rejected.

### Quick Action Shortcuts
For convenience, you can use the action buttons next to the dropdown:
*   **From `pending`**:
    *   Click **Approve (Checkmark)** ➡️ Transitions status directly to **Active** (book checked out).
    *   Click **Cancel (X)** ➡️ Transitions status to **Cancelled**.
*   **From `active`**:
    *   Click **Mark Returned (Refresh icon)** ➡️ Transitions status to **Returned**. This automatically increases the book's `availableCopies` count by 1 in the inventory so other users can rent it.

---

## 6. Registered Members Management
The **Users** tab displays registered community readers:
*   View member names, emails, and signup dates.
*   Check contact phone numbers to coordinate pickup details or follow up on overdue loans.
*   Admin accounts are flagged with the `admin` role, and standard members have the `user` role.

---

## 7. Customer Support Desk
Support queries submitted by users in their accounts appear in the **Support Tickets** grid:
*   Review query category (Payment, Delivery, Account, Other) and message.
*   Coordinate directly with the member using your primary email address: **`admin@nextdoorlibrary.in`**.
*   Once resolved, mark the ticket complete.
