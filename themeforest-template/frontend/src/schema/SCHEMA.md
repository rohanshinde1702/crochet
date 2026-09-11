# CozyLoops - Data Schema Specification

This document outlines the standard data models used throughout the CozyLoops template. When building or connecting a custom backend (Node/Express, Supabase, Firebase, Laravel, Django, Python FastAPI, Go, etc.), your API responses should match or map to these schemas.

---

## 1. Product Schema (`Product`)

Represents an individual handmade creation in the store catalog.

### TypeScript / JSDoc Interface
```typescript
interface Product {
  id: number | string;            // Unique identifier
  title: string;                  // Product name (e.g., "Handmade Velvet Crochet Bear")
  category: string;               // Category name (e.g., "Decor & Gifts")
  price: number;                  // Selling price
  originalPrice?: number;         // Strikethrough price for discounts
  img: string;                    // Primary thumbnail image path
  images?: string[];              // Additional gallery image paths
  rating: number;                 // Star rating (1.0 - 5.0)
  reviewsCount: number;           // Total verified customer reviews
  badge?: string;                 // Badge label ("Bestseller", "Top Rated", "New Arrival")
  material: string;               // Yarn/material composition description
  description: string;            // Product description & artisan story
  tags?: string[];                // Search and filter tags
  inStock: boolean;               // In-stock availability
  stockQuantity?: number;         // Quantity in stock
  dimensions?: string;            // Physical dimensions (e.g. "15cm x 10cm")
  careInstructions?: string;      // Washing & care instructions
  featured?: boolean;             // Highlight on homepage
  isDeleted?: boolean;            // Soft-deleted state
}
```

### Example JSON
```json
{
  "id": 1,
  "title": "Handmade Velvet Crochet Bear",
  "category": "Decor & Gifts",
  "price": 1299,
  "originalPrice": 1599,
  "img": "/uploads/products/decor/crochet-bear.jpg",
  "images": [
    "/uploads/products/decor/crochet-bear.jpg",
    "/uploads/products/decor/crochet-bear-side.jpg"
  ],
  "rating": 4.9,
  "reviewsCount": 48,
  "badge": "Bestseller",
  "material": "100% Organic Chenille Velvet Yarn with hypoallergenic polyfill stuffing",
  "description": "Lovingly hand-crocheted with ultra-soft velvet yarn, this charming bear adds warmth to any nursery or cozy corner.",
  "tags": ["bear", "plush", "velvet", "handmade", "gift", "nursery"],
  "inStock": true,
  "stockQuantity": 15,
  "dimensions": "28cm (H) x 18cm (W)",
  "careInstructions": "Hand wash gently with mild detergent in cold water. Lay flat to dry.",
  "featured": true,
  "isDeleted": false
}
```

---

## 2. Category Schema (`Category`)

Represents a product collection.

### TypeScript / JSDoc Interface
```typescript
interface Category {
  name: string;                   // Display title (e.g., "Wearables & Shawls")
  slug: string;                   // URL-safe slug (e.g., "wearables-shawls")
  icon: string;                   // Emoji or icon identifier
  description: string;            // Category summary description
  image: string;                  // Category cover/card image URL
  featured: boolean;              // Display in featured grid
  displayOrder: number;           // Sorting order
  isDeleted?: boolean;            // Soft-delete state
}
```

### Example JSON
```json
{
  "name": "Wearables & Shawls",
  "slug": "wearables-shawls",
  "icon": "🧣",
  "description": "Cozy cardigans, delicate lace shawls, beanies, and winter wraps handcrafted for warmth.",
  "image": "/uploads/categories/wearables.jpg",
  "featured": true,
  "displayOrder": 1,
  "isDeleted": false
}
```

---

## 3. Blog Post Schema (`Blog`)

Represents craft guides, crochet tutorials, yarn reviews, and artisan stories.

### TypeScript / JSDoc Interface
```typescript
interface BlogContentBlock {
  type: "paragraph" | "heading" | "quote" | "tip" | "image";
  text?: string;
  title?: string;
  url?: string;
  caption?: string;
}

interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
}

interface BlogComment {
  id: number | string;
  name: string;
  date: string;
  avatar: string;
  text: string;
}

interface Blog {
  id: number | string;
  slug: string;
  category: string;
  title: string;
  readTime: string;
  readMinutes: number;
  date: string;
  isoDate: string;
  featured: boolean;
  author: BlogAuthor;
  img: string;
  excerpt: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  content: BlogContentBlock[];
  comments: BlogComment[];
  isDeleted?: boolean;
}
```

### Example JSON
```json
{
  "id": 1,
  "slug": "complete-guide-crochet-yarn-types",
  "category": "Yarn 101",
  "title": "The Ultimate Guide to Choosing the Perfect Crochet Yarn for Every Project",
  "readTime": "6 min read",
  "readMinutes": 6,
  "date": "March 15, 2026",
  "isoDate": "2026-03-15",
  "featured": true,
  "author": {
    "name": "Ananya Sharma",
    "role": "Master Artisan & Founder",
    "avatar": "/uploads/avatars/ananya.jpg"
  },
  "img": "/uploads/blogs/yarn-guide.jpg",
  "excerpt": "Discover how yarn weight, fiber content, and ply affect your tension, drape, and final piece.",
  "tags": ["Yarn Guide", "Beginner Tips", "Crochet Basics"],
  "likesCount": 128,
  "commentsCount": 14,
  "content": [
    {
      "type": "paragraph",
      "text": "Choosing the right yarn is the foundation of every breathtaking crochet creation..."
    },
    {
      "type": "tip",
      "title": "Artisan Tip",
      "text": "Always check your dye lot number when purchasing multiple skeins for large blankets!"
    }
  ],
  "comments": [
    {
      "id": 1,
      "name": "Priya Kapoor",
      "date": "March 16, 2026",
      "avatar": "/uploads/avatars/user-1.jpg",
      "text": "This yarn guide answered every question I had regarding cotton vs bamboo blends!"
    }
  ],
  "isDeleted": false
}
```

---

## 4. Order Schema (`Order`)

Represents store checkout orders and transaction tracking.

### TypeScript / JSDoc Interface
```typescript
interface OrderItem {
  id: number | string;
  title: string;
  category: string;
  price: number;
  quantity: number;
  img: string;
}

interface Order {
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: "UPI" | "Credit Card" | "NetBanking" | "COD";
  paymentStatus: "Paid" | "Pending" | "Failed";
  status: "Processing" | "Shipped" | "Delivered" | "Pending" | "Cancelled";
  date: string;
  trackingNumber?: string;
  notes?: string;
  isDeleted?: boolean;
}
```

---

## 5. Store Settings Schema (`StoreSettings`)

Represents global store configuration, contact details, social links, and policies.

### TypeScript / JSDoc Interface
```typescript
interface StoreSettings {
  storeName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  businessHours: string;
  socialLinks: {
    instagram?: string;
    pinterest?: string;
    facebook?: string;
    youtube?: string;
  };
  freeShippingLimit: number;
  currency: string;
  maintenanceMode: boolean;
}
```

---

## 6. Validation Helpers

Located in `src/schema/schema.js`, you can import runtime validation helpers:

```javascript
import { validateProduct, validateBlog, validateCategory } from "../schema/schema";

if (validateProduct(newProductData)) {
  // Save or submit payload
}
```
