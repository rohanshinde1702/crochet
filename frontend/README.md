# CozyLoops - Handcrafted Crochet React eCommerce & Admin Template

A modern, responsive, and ultra-clean React eCommerce template designed for artisan crafters, handmade crochet businesses, boutique studios, and creative stores.

Built with **React 18**, **Vite**, **Lucide Icons**, and pure CSS modules with zero CSS framework lock-in.

---

## 🌟 Key Features

- **100% Standalone Ready**: Fully functional frontend with pre-configured schemas, mock datasets, and browser `localStorage` persistence. No backend server required out-of-the-box!
- **ThemeForest Compliant**: All images are standardized with dimension-indicating placeholders (`1905 × 680`, `600 × 600`, `1200 × 750`).
- **Complete Admin Panel**: Built-in Dashboard with Product Management, Category Management, Blog Manager, Order Management, Customer Directory, Recycle Bin, and Store Settings.
- **Cart & Wishlist System**: Dynamic cart drawer, checkout simulator, and persistent wishlist.
- **Fast & Lightweight**: Built on Vite with sub-second HMR and optimized production bundles (~150KB gzip).
- **Backend-Agnostic Schema**: Easily connect to any backend REST/GraphQL API (Node.js, Firebase, Supabase, Laravel, Django, etc.).

---

## 📁 Project Structure

```text
frontend/
├── public/
│   └── uploads/              # Standard dimension placeholder assets
├── src/
│   ├── components/           # Reusable UI components (Header, Footer, Modals, Sliders)
│   ├── config/
│   │   └── api.js            # Central API endpoints configuration
│   ├── context/
│   │   ├── AdminThemeContext.jsx  # Admin dark/light theme state
│   │   └── SettingsContext.jsx    # Store identity & contact state
│   ├── data/                 # Seed datasets conforming to schema specifications
│   │   ├── blogs.js          # Blog posts data
│   │   ├── categories.js     # Category list & icons
│   │   ├── customers.js      # Customer records
│   │   ├── media.js          # Image asset directory
│   │   ├── orders.js         # Sample order histories
│   │   ├── products.js       # Handcrafted product catalog
│   │   ├── settings.js       # Store configuration
│   │   └── index.js          # Centralized data exports
│   ├── pages/                # Public store pages & Admin dashboard views
│   ├── schema/
│   │   ├── schema.js         # JSDoc type definitions & validators
│   │   └── SCHEMA.md         # Full Data Schema documentation
│   ├── services/
│   │   └── dataService.js    # Data layer with localStorage persistence & API fallback
│   ├── styles/               # Modular CSS stylesheets
│   ├── App.jsx               # Application routes & layout wrapper
│   └── main.jsx              # React entry point
├── .env.example              # Environment variables template
├── package.json
└── vite.config.js
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
The compiled, production-ready static assets will be in the `dist/` directory.

---

## 📊 Data Schema & Customization

All data structures are standardized and documented under `src/schema/schema.js`.

To customize default products, categories, or blogs without touching UI code, simply edit the files inside `src/data/`:
- **Products**: `src/data/products.js`
- **Categories**: `src/data/categories.js`
- **Blogs**: `src/data/blogs.js`
- **Store Settings**: `src/data/settings.js`

For comprehensive schema definitions and field descriptions, see [src/schema/SCHEMA.md](src/schema/SCHEMA.md).

---

## 🔌 Connecting Your Own Backend

By default, the template runs in **Standalone Mode** using browser `localStorage` to simulate CRUD operations (add product, edit blog, delete category, update settings).

To connect your custom REST API:
1. Open `.env` (or copy `.env.example` to `.env`):
   ```env
   VITE_API_URL=https://your-api-server.com
   ```
2. The `src/services/dataService.js` automatically attempts to call endpoints configured in `src/config/api.js` and gracefully falls back to local storage when offline.

---

## 📐 Image Dimension Standards

| Usage | Recommended Resolution | Aspect Ratio | Location |
| :--- | :--- | :--- | :--- |
| **Hero Slider Banners** | `1905 × 680 px` | ~2.8:1 | `/uploads/slider-*.png`, `/uploads/shop-hero.jpg` |
| **Product Thumbnails** | `600 × 600 px` | 1:1 | `/uploads/products/...` |
| **Category Banners** | `600 × 400 px` | 3:2 | `/uploads/categories/...` |
| **Blog Featured Covers**| `1200 × 750 px` | 16:10 | `/uploads/blogs/...` |
| **Avatars / Team** | `300 × 300 px` | 1:1 | `/uploads/avatars/...` |

---

## 📄 License & Support

Created for commercial distribution on Envato / ThemeForest. For assistance and documentation inquiries, please refer to the documentation included in the package.
