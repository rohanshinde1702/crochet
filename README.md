# 🧶 CozyLoops — Project Workspace

This workspace contains two distinct, fully-functional editions of **CozyLoops**:

---

## 📁 Workspace Folders

```text
crochet/
├── real-website/                    # 1. REAL FULL-STACK MERN WEBSITE
│   ├── backend/                     # Node.js + Express REST API with MongoDB
│   │   ├── models/                  # Mongoose schemas (Product, Order, Blog, Review, Setting...)
│   │   ├── uploads/                 # Original real high-resolution artisan photography
│   │   ├── seeder.js                # Seeds real products and orders to MongoDB
│   │   └── server.js                # Server entry point (port 5000)
│   ├── frontend/                    # React 19 + Vite frontend connected to backend API
│   │   └── public/uploads/          # Original real high-resolution images
│   └── README.md                    # MERN setup & run guide
│
├── themeforest-template/            # 2. THEMEFOREST STANDALONE REACT TEMPLATE
│   ├── Documentation/               # ThemeForest-standard HTML documentation & guide
│   │   ├── index.html               # Interactive documentation guide
│   │   └── INSTALLATION.md          # Markdown quick start guide
│   ├── frontend/                    # Standalone React + Vite template (zero backend needed)
│   │   ├── public/
│   │   │   ├── uploads/             # Dimension placeholder images (1905x680, 600x600...)
│   │   │   └── _redirects           # Netlify SPA redirect
│   │   ├── src/
│   │   │   ├── data/                # Mock seed datasets
│   │   │   ├── schema/              # Central JSDoc schemas & SCHEMA.md
│   │   │   └── services/            # dataService.js with localStorage persistence
│   │   ├── netlify.toml             # Netlify build configuration
│   │   └── package.json             # Package metadata (v1.0.0)
│   └── README.md                    # ThemeForest distribution README
│
└── README.md
```

---

## 🚀 Quick Navigation

### 🌐 1. Running the Real Website (Full-Stack MERN + MongoDB)
To run your live store with real database operations and authentic photos:
```bash
# Terminal 1: Backend
cd real-website/backend
npm install
node seeder.js     # Seeds MongoDB database
npm run dev        # Runs on http://localhost:5000

# Terminal 2: Frontend
cd real-website/frontend
npm install
npm run dev        # Runs on http://localhost:5173
```
See [real-website/README.md](real-website/README.md) for full instructions.

---

### 📦 2. Testing / Packaging the ThemeForest Template
To test or deploy the standalone marketplace template:
```bash
cd themeforest-template/frontend
npm install
npm run dev        # Runs in Standalone Mode on http://localhost:5173
npm run build      # Builds production bundle to dist/
```
Open **`themeforest-template/Documentation/index.html`** in any browser for the complete ThemeForest documentation guide.
