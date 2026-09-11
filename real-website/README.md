# 🧶 CozyLoops — Real Full-Stack MERN Website

> Production-ready Full-Stack MERN (MongoDB, Express.js, React, Node.js) web application with real high-resolution artisan photography, live database queries, customer auth with email OTP verification, order management, and full Executive Admin Studio.

---

## 📁 Architecture Overview

```text
real-website/
├── backend/                  # Node.js + Express REST API Server
│   ├── config/               # MongoDB connection (db.js) & Nodemailer setup
│   ├── controllers/          # Business logic handlers (Products, Blogs, Orders, Auth, etc.)
│   ├── data/                 # Seed datasets (products, categories, blogs, users, orders)
│   ├── middleware/           # JWT auth verification & Multer upload middleware
│   ├── models/               # Mongoose data models (Product, Category, Blog, Order, User, Review, Setting, OTP)
│   ├── routes/               # API endpoint routers (/api/products, /api/auth, /api/orders...)
│   ├── uploads/              # Real high-resolution artisan photography & media
│   ├── .env.example          # Sample environment variables
│   ├── seeder.js             # Database seeder (seeds real data into MongoDB)
│   ├── server.js             # Express application entrypoint (port 5000)
│   └── package.json
│
├── frontend/                 # React 19 + Vite Frontend Storefront & Admin
│   ├── public/
│   │   └── uploads/          # Real high-resolution artisan images
│   ├── src/                  # React UI components querying http://localhost:5000/api
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.

---

### 2. Start Backend Server

```bash
# 1. Navigate to backend directory
cd real-website/backend

# 2. Install dependencies (if not already installed)
npm install

# 3. Configure environment variables (.env)
# Copy .env.example to .env
cp .env.example .env
```

Ensure your `backend/.env` has your MongoDB connection URI:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/crochet
JWT_SECRET=your_jwt_secret_key_2026
ADMIN_EMAIL=admin@cozyloops.com

# Email configuration for OTP verification & contact form (Optional for local testing)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

#### Seed Real Data into MongoDB:
```bash
node seeder.js
```

#### Start Backend:
```bash
npm run dev
# Server running at: http://localhost:5000
```

---

### 3. Start Frontend App

```bash
# In a new terminal, navigate to frontend directory
cd real-website/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App running at: http://localhost:5173
```

---

## 🔑 Default Accounts (from Seeder)

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cozyloops.com` | `Password@123` | Storefront + Admin Studio (`/admin`) |
| **Customer** | `aarav.s@gmail.com` | `Password@123` | Storefront + Profile (`/profile`) |
| **Customer** | `priya.p@outlook.com` | `Password@123` | Storefront + Profile (`/profile`) |

---

## 🛠️ Features & MongoDB Collections

- **Products Collection (`Product`)**: Live catalog, stock management, price adjustments, and soft-delete recycle bin.
- **Reviews Collection (`Review`)**: Real customer reviews and star ratings.
- **Orders Collection (`Order`)**: Real order placement, item line tracking, delivery status updates (`Processing` -> `Shipped` -> `Delivered`).
- **Blogs Collection (`Blog`)**: Craft guides, spotlight articles, tags, and interactive comments.
- **Settings Collection (`Setting`)**: Real-time studio contact info, phone, WhatsApp, working hours, and social media link propagation.
- **Users Collection (`User`)**: Secure password hashing with bcrypt, JWT authentication, and OTP verification.
