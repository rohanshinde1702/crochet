# 🧶 CozyLoops — Handcrafted Crochet React eCommerce & Admin Template

> A modern, responsive, and ultra-clean React eCommerce and Executive Admin Studio template designed for artisan crafters, handmade crochet businesses, boutique studios, and creative stores.

Built with **React 18**, **Vite**, **Lucide Icons**, and pure CSS modules with zero heavy dependencies.

---

## 🌟 Key Highlights

- **100% Standalone Ready**: Fully functional frontend out of the box with pre-configured schemas, mock datasets, and browser `localStorage` persistence.
- **ThemeForest Compliant**: All 46 demo images use neutral, dimension-indicating placeholders (`1905 × 680`, `600 × 600`, `1200 × 750`, etc.).
- **Executive Admin Studio (`/admin`)**: Built-in Analytics Dashboard, Product Catalog Manager, Category Manager, Story/Blog Publisher, Order Fulfillment Center, Customer Directory, Soft-delete Recycle Bin, and Global Store Settings.
- **Cart & Wishlist System**: Interactive slide-out cart drawer, free shipping threshold progress meter, and persistent wishlist.
- **Backend-Agnostic Schemas**: Ready to connect to any backend API (Node/Express, Firebase, Supabase, Laravel, Django, Python FastAPI, Go, etc.) via `src/config/api.js`.

---

## 📁 Package Structure

```text
crochet/
├── Documentation/            # Interactive HTML Documentation
│   ├── index.html            # Complete Documentation Guide
│   └── INSTALLATION.md       # Quick start markdown instructions
├── frontend/                 # React Application Source
│   ├── public/
│   │   └── uploads/          # Dimension placeholder image assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── config/           # API configuration
│   │   ├── context/          # State providers (SettingsContext, AdminThemeContext)
│   │   ├── data/             # Standalone seed datasets
│   │   ├── pages/            # Storefront and Admin views
│   │   ├── schema/           # Data schemas, models, and validators
│   │   ├── services/         # Data service layer (localStorage + API)
│   │   ├── styles/           # CSS stylesheets
│   │   └── App.jsx           # App layout and routing
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Build Production Bundle
```bash
npm run build
```
Compiled production files are output to `frontend/dist/`.

---

## 📊 Data Customization & Schemas

To customize store data without touching React components:
- **Products Catalog**: `frontend/src/data/products.js`
- **Store Categories**: `frontend/src/data/categories.js`
- **Craft Journal & Blogs**: `frontend/src/data/blogs.js`
- **Store Settings & Contact Info**: `frontend/src/data/settings.js`

Full schema definitions and TypeScript/JSDoc types are available in [frontend/src/schema/SCHEMA.md](frontend/src/schema/SCHEMA.md).

---

## 📐 Image Dimension Standards

| Usage | Dimensions | Aspect Ratio | Location |
| :--- | :--- | :--- | :--- |
| **Hero Slider Banners** | `1905 × 680 px` | ~2.8:1 | `/uploads/slider-*.png` |
| **Product Cards** | `600 × 600 px` | 1:1 | `/uploads/products/...` |
| **Category Banners** | `600 × 400 px` | 3:2 | `/uploads/categories/...` |
| **Blog Featured Covers**| `1200 × 750 px` | 16:10 | `/uploads/blogs/...` |
| **Avatars / Team** | `300 × 300 px` | 1:1 | `/uploads/avatars/...` |

---

## 📚 Full Interactive Documentation

Open **`Documentation/index.html`** in any web browser to view the interactive documentation guide.

---

## 📄 License & Attribution

- Created for commercial distribution on ThemeForest / Envato Market.
- Libraries used: React (MIT), Vite (MIT), Lucide Icons (ISC), Google Fonts (OFL).
