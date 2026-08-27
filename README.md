# 🧶 CozyLoops — Handcrafted Crochet E-Commerce Store & Admin Studio

> A full-stack MERN (MongoDB, Express, React, Node.js) e-commerce web application featuring a boutique handcrafted storefront, customer authentication with email OTP, automated order routing, and a multi-page **Executive Admin Studio** with Dark & Light theme modes.

---

## 🌟 Key Features

### 🛍️ Customer Storefront
- **Artisanal Home & Shop**: Hero sliders, curated collections, dynamic category tabs, stock indicators, and price filters.
- **Product Details**: Multi-angle image preview, rating reviews, yarn material tags, social sharing, and instant cart/wishlist sync.
- **Story Journal / Blog**: Craft tutorials, yarn selection guides, read-time calculator, and comments stream.
- **Shopping Bag & Checkout**: Local & cloud-synced cart, free shipping calculation, delivery form, and simulated payment.
- **Contact Us**: Connected to dynamic store settings with **automated email dispatch** directly to the store administrator's inbox.
- **Customer Account**: Profile dashboard, saved shipping address, order history tracking, and security settings.

### ⚡ Executive Admin Studio (`/admin`)
- **🌓 Dark & Light Theme Modes**: Quick toggle button in header, persistent theme preference in `localStorage`.
- **📊 Command Analytics Dashboard**: Gross revenue counter, total orders, average order value, registered customers, interactive monthly revenue chart, category revenue distribution, store health metrics, top creations leaderboard, and live activity stream.
- **🧶 Product Catalog Management**: Add, edit, soft-delete to Recycle Bin, inventory units tracker, and CSV export.
- **🗂️ Categories Manager**: Emoji icons, category descriptions, and live product counter.
- **🛍️ Order Fulfillment Hub**: Live MongoDB order tracking, 1-click status dropdowns (`Processing` -> `Shipped` -> `Delivered`), and CSV export.
- **👥 Customer Directory**: Lifetime spend aggregator, order history count, and VIP badges.
- **📝 Stories & Blog Studio**: Full markdown/HTML story composer, category tagging, and spotlight featured toggles.
- **♻️ Dedicated Recycle Bin**: Separate tabs for Deleted Products and Deleted Blogs, 1-click instant restore, permanent purge, and empty bin modal.
- **🖼️ Media Library**: Image asset browser with category filtering and 1-click clipboard URL copy.
- **⚙️ Store Settings**: Update Store Name, Support Email, Phone Number, WhatsApp Number, Studio Address, Working Hours, Social Media Links (Instagram, Facebook, Pinterest, YouTube, Twitter/X), Free Shipping threshold, and Currency.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, React Router DOM v7, React Icons |
| **Backend** | Node.js, Express.js, Mongoose ODM, JSON Web Tokens (JWT), Bcrypt.js, Multer |
| **Database** | MongoDB (Local Community Server or MongoDB Atlas Cloud) |
| **Email Service** | Nodemailer (Gmail SMTP Service / App Passwords) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB** (Local instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

---

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env
cp .env.example .env
```

Edit `backend/.env` with your settings:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/crochet
JWT_SECRET=your_super_secret_jwt_key_2026

# Administrator Email
ADMIN_EMAIL=admin@cozyloops.com

# SMTP Email Configuration (for OTP verification and Contact messages)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_gmail_app_password
```

#### Seed Demo Data (Products, Categories, Orders, Customers, Blogs, Settings)
```bash
node seeder.js
```

#### Start Backend Server
```bash
npm run dev
# Server running at http://localhost:5000
```

---

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cozyloops.com` | `Password@123` | Storefront + Admin Studio (`/admin`) |
| **Customer** | `aarav.s@gmail.com` | `Password@123` | Storefront + Profile (`/profile`) |
| **Customer** | `priya.p@outlook.com` | `Password@123` | Storefront + Profile (`/profile`) |

---

## 📁 Project Directory Structure

```
crochet/
├── backend/
│   ├── config/             # DB & Nodemailer connection
│   ├── controllers/        # Express request handlers (Products, Orders, Blogs, Settings, Auth, etc.)
│   ├── data/               # Seed datasets (products, categories, orders, customers, blogs)
│   ├── middleware/         # Auth verification & error handling
│   ├── models/             # Mongoose schemas (Product, Order, Category, Blog, Setting, User, OTP)
│   ├── routes/             # REST API endpoint routes
│   ├── uploads/            # Static image assets (products, blogs, banners)
│   ├── .env.example        # Sample environment variables
│   ├── seeder.js           # Database population script
│   └── server.js           # Express main server entrypoint
│
├── frontend/
│   ├── public/             # Static public assets & favicons
│   ├── src/
│   │   ├── assets/         # CSS styles & design tokens
│   │   ├── components/     # Reusable UI components (Header, Footer, TopBar, Modals, Cards)
│   │   ├── context/        # React Context (SettingsContext, AdminThemeContext)
│   │   ├── layouts/        # Layout wrappers (AdminLayout)
│   │   ├── pages/          # Storefront & Admin page views
│   │   │   ├── admin/      # Dedicated Admin pages (Dashboard, Products, Orders, Settings, etc.)
│   │   │   ├── Shop.jsx, ProductDetail.jsx, Blog.jsx, Contact.jsx, Cart.jsx, Profile.jsx...
│   │   ├── routes/         # React Router route definitions
│   │   ├── utils/          # Helpers & localStorage sync
│   │   ├── App.jsx         # App root & toast notification manager
│   │   └── main.jsx        # React root mount & providers
│   ├── package.json
│   └── vite.config.js
│
└── Documentation/          # Standalone HTML Documentation
    └── index.html
```

---

## 📄 License & Attribution

- Created with ❤️ by CozyLoops Studio.
- All code is structured for commercial deployment and marketplace submission (ThemeForest / CodeCanyon).
