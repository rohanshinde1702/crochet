# CozyLoops - Quick Installation & Setup Guide

This guide walks you through setting up and running the **CozyLoops React eCommerce & Admin Template** in less than 2 minutes.

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm** (v9+), **yarn**, or **pnpm**

---

## ⚡ 1. Quick Start (Local Development)

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser and visit: **`http://localhost:5173`**

---

## 🛠️ 2. Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The compiled, production-ready static files will be generated in the `dist/` directory, ready to deploy to any hosting service (Vercel, Netlify, Cloudflare Pages, GitHub Pages, Apache, or Nginx).

---

## 🗄️ 3. Standalone Mode & Customizing Data

CozyLoops is pre-configured with complete mock datasets and browser `localStorage` persistence.

To customize products, blogs, categories, or store information:
- **Products**: Edit `src/data/products.js`
- **Categories**: Edit `src/data/categories.js`
- **Blogs**: Edit `src/data/blogs.js`
- **Store Settings**: Edit `src/data/settings.js`

---

## 🔌 4. Connecting a Custom Backend API

To connect the template to your custom REST API:
1. Copy `.env.example` to `.env`:
   ```env
   VITE_API_URL=https://your-api-server.com
   ```
2. The `src/services/dataService.js` will automatically use your backend endpoints and fall back to local storage if offline.

---

## 📖 Full Documentation

Open **`Documentation/index.html`** in your browser for the full interactive guide, schema specifications, component walkthroughs, and theming guide.
