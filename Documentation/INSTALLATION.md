# 📦 CozyLoops Quick Installation & Setup Guide

This guide walks you through setting up **CozyLoops** locally or in production in under 5 minutes.

---

## ⚡ Prerequisites

1. **Node.js** (v18 or higher) — [Download Node.js](https://nodejs.org/)
2. **MongoDB** (Local Community Server or [MongoDB Atlas Cloud](https://www.mongodb.com/cloud/atlas))
3. **npm** (v9 or higher)

---

## 🛠️ Step 1: Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install required packages
npm install

# 3. Create .env file from template
cp .env.example .env
```

### Configure `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/crochet
JWT_SECRET=your_jwt_secret_key_here
ADMIN_EMAIL=admin@cozyloops.com

# SMTP configuration for email OTP & Contact forms
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Seed Database with Demo Products & Admin:
```bash
node seeder.js
```

### Start Backend Server:
```bash
npm run dev
# Running on http://localhost:5000
```

---

## 🎨 Step 2: Frontend Setup

```bash
# 1. Open a new terminal and navigate to frontend directory
cd frontend

# 2. Install frontend packages
npm install

# 3. Launch Vite Development Server
npm run dev
# Open in browser: http://localhost:5173
```

---

## 🔑 Default Credentials

- **Admin Portal**: `http://localhost:5173/admin`
  - **Email**: `admin@cozyloops.com`
  - **Password**: `Password@123`
- **Customer Account**:
  - **Email**: `aarav.s@gmail.com`
  - **Password**: `Password@123`

---

## 📁 Standalone Documentation
Open **`Documentation/index.html`** in any browser for complete interactive documentation, API guides, and deployment walkthroughs.
