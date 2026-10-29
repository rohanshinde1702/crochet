/**
 * @file dataService.js
 * @description Standalone Data Service layer that enables full React template functionality
 * with zero backend required. Automatically synchronizes with localStorage and provides
 * seamless fallback to schema datasets.
 */

import productsJson from "../data/Product/products.json";
import categoriesJson from "../data/Product/categories.json";
import blogsJson from "../data/Blog/blogs.json";
import ordersJson from "../data/Order/orders.json";
import customersJson from "../data/Customer/customers.json";
import settingsJson from "../data/Settings/settings.json";
import mediaJson from "../data/Product/media.json";

// Extract arrays safely from the JSON modules
const productsData = productsJson.default || productsJson.productsData || productsJson;
const categoriesData = categoriesJson.categoriesData || categoriesJson.default || categoriesJson;
const blogsData = blogsJson.default || blogsJson.blogsData || blogsJson;
const ordersData = ordersJson.default || ordersJson.ordersData || ordersJson;
const customersData = customersJson.default || customersJson.customersData || customersJson;
const settingsData = settingsJson.default || settingsJson.settingsData || settingsJson;
const mediaData = mediaJson.default || mediaJson.mediaData || mediaJson;

// Storage Keys
const STORAGE_KEYS = {
  PRODUCTS: "cozyloops_products",
  CATEGORIES: "cozyloops_categories",
  BLOGS: "cozyloops_blogs",
  ORDERS: "cozyloops_orders",
  CUSTOMERS: "cozyloops_customers",
  SETTINGS: "cozyloops_settings",
  MEDIA: "cozyloops_media"
};

/**
 * Initialize storage with default schema datasets if not already populated
 */
export const initDataStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BLOGS)) {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogsData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ordersData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customersData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEDIA)) {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(mediaData));
  }
};

// Safe JSON Parse Helper
const getStoredList = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (parsed && parsed.__esModule) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return parsed;
  } catch (e) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
};

/**
 * Helper to ensure every product has a 4-image gallery for lightboxes and thumbnails
 */
export const getProductGallery = (product) => {
  if (!product) return [];
  if (Array.isArray(product.images) && product.images.length > 1) {
    return product.images;
  }
  const main = product.img || "/uploads/products/decor/sunflower.png";
  const cat = (product.category || "").toLowerCase();
  let alternates;

  if (cat.includes("kids") || cat.includes("baby")) {
    alternates = [
      "/uploads/products/kids/hat.png",
      "/uploads/products/kids/category-1.png",
      "/uploads/others/contact_bunny.jpg"
    ];
  } else if (cat.includes("decor") || cat.includes("gift")) {
    alternates = [
      "/uploads/products/decor/flower keychain.png",
      "/uploads/products/decor/Cornus florida.png",
      "/uploads/products/decor/category-1.png"
    ];
  } else if (cat.includes("home") || cat.includes("living")) {
    alternates = [
      "/uploads/products/home/category-1.png",
      "/uploads/products/home/category-2.png",
      "/uploads/others/contact_hearts_basket.jpg"
    ];
  } else if (cat.includes("pet") || cat.includes("animal")) {
    alternates = [
      "/uploads/products/pet/bee.png",
      "/uploads/products/pet/frog.png",
      "/uploads/products/pet/panda.png"
    ];
  } else {
    alternates = [
      "/uploads/products/custom/letter-r.png",
      "/uploads/products/custom/category-1.png",
      "/uploads/others/madeByHand.png"
    ];
  }

  const set = new Set([main, ...alternates]);
  return Array.from(set).slice(0, 4);
};

/* ==========================================================================
   PRODUCTS SERVICE
   ========================================================================== */

export const getProducts = async (includeDeleted = false) => {
  const list = getStoredList(STORAGE_KEYS.PRODUCTS, productsData);
  const filtered = includeDeleted ? list : list.filter((p) => !p.isDeleted);
  return filtered.map((p) => ({
    ...p,
    images: getProductGallery(p)
  }));
};

export const getProductById = async (id) => {
  const numericId = Number(id);
  const list = getStoredList(STORAGE_KEYS.PRODUCTS, productsData);
  const found = list.find((p) => p.id === numericId || p.id === id) || null;
  if (!found) return null;
  return {
    ...found,
    images: getProductGallery(found)
  };
};

export const saveProduct = async (productData) => {
  const list = getStoredList(STORAGE_KEYS.PRODUCTS, productsData);
  let updatedList;

  if (productData.id) {
    // Update
    updatedList = list.map((p) => (p.id === Number(productData.id) || p.id === productData.id ? { ...p, ...productData } : p));
  } else {
    // Create new
    const maxId = list.reduce((max, p) => (typeof p.id === "number" && p.id > max ? p.id : max), 0);
    const newProduct = {
      ...productData,
      id: maxId + 1,
      rating: productData.rating || 5.0,
      reviewsCount: productData.reviewsCount || 0,
      inStock: productData.inStock !== false,
      isDeleted: false
    };
    updatedList = [newProduct, ...list];
  }

  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("productsUpdated", { detail: updatedList }));
  return productData;
};

export const deleteProduct = async (id, permanent = false) => {
  const list = getStoredList(STORAGE_KEYS.PRODUCTS, productsData);
  let updatedList;
  if (permanent) {
    updatedList = list.filter((p) => p.id !== Number(id) && p.id !== id);
  } else {
    updatedList = list.map((p) => (p.id === Number(id) || p.id === id ? { ...p, isDeleted: true } : p));
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("productsUpdated", { detail: updatedList }));
};

export const restoreProduct = async (id) => {
  const list = getStoredList(STORAGE_KEYS.PRODUCTS, productsData);
  const updatedList = list.map((p) => (p.id === Number(id) || p.id === id ? { ...p, isDeleted: false } : p));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("productsUpdated", { detail: updatedList }));
};

/* ==========================================================================
   CATEGORIES SERVICE
   ========================================================================== */

export const getCategories = async (includeDeleted = false) => {
  const list = getStoredList(STORAGE_KEYS.CATEGORIES, categoriesData);
  return includeDeleted ? list : list.filter((c) => !c.isDeleted);
};

export const saveCategory = async (categoryData) => {
  const list = getStoredList(STORAGE_KEYS.CATEGORIES, categoriesData);
  let updatedList;
  if (categoryData.id || categoryData._id) {
    const targetId = categoryData.id || categoryData._id;
    updatedList = list.map((c) => (c.id === targetId || c._id === targetId ? { ...c, ...categoryData } : c));
  } else {
    const maxId = list.reduce((max, c) => (typeof c.id === "number" && c.id > max ? c.id : max), 0);
    const newCategory = {
      ...categoryData,
      id: maxId + 1,
      slug: categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      isDeleted: false
    };
    updatedList = [newCategory, ...list];
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("categoriesUpdated", { detail: updatedList }));
  return categoryData;
};

export const deleteCategory = async (id, permanent = false) => {
  const list = getStoredList(STORAGE_KEYS.CATEGORIES, categoriesData);
  let updatedList;
  if (permanent) {
    updatedList = list.filter((c) => c.id !== id && c._id !== id);
  } else {
    updatedList = list.map((c) => (c.id === id || c._id === id ? { ...c, isDeleted: true } : c));
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("categoriesUpdated", { detail: updatedList }));
};

/* ==========================================================================
   BLOGS SERVICE
   ========================================================================== */

export const getBlogs = async (includeDeleted = false) => {
  const list = getStoredList(STORAGE_KEYS.BLOGS, blogsData);
  return includeDeleted ? list : list.filter((b) => !b.isDeleted);
};

export const getBlogById = async (id) => {
  const list = getStoredList(STORAGE_KEYS.BLOGS, blogsData);
  return list.find((b) => b.id === Number(id) || b.id === id || b.slug === id) || null;
};

export const saveBlog = async (blogData) => {
  const list = getStoredList(STORAGE_KEYS.BLOGS, blogsData);
  let updatedList;
  if (blogData.id) {
    updatedList = list.map((b) => (b.id === Number(blogData.id) || b.id === blogData.id ? { ...b, ...blogData } : b));
  } else {
    const maxId = list.reduce((max, b) => (typeof b.id === "number" && b.id > max ? b.id : max), 0);
    const newBlog = {
      ...blogData,
      id: maxId + 1,
      slug: blogData.slug || blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      date: blogData.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      likesCount: 0,
      commentsCount: 0,
      comments: [],
      isDeleted: false
    };
    updatedList = [newBlog, ...list];
  }
  localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("blogsUpdated", { detail: updatedList }));
  return blogData;
};

export const deleteBlog = async (id, permanent = false) => {
  const list = getStoredList(STORAGE_KEYS.BLOGS, blogsData);
  let updatedList;
  if (permanent) {
    updatedList = list.filter((b) => b.id !== Number(id) && b.id !== id);
  } else {
    updatedList = list.map((b) => (b.id === Number(id) || b.id === id ? { ...b, isDeleted: true } : b));
  }
  localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("blogsUpdated", { detail: updatedList }));
};

export const restoreBlog = async (id) => {
  const list = getStoredList(STORAGE_KEYS.BLOGS, blogsData);
  const updatedList = list.map((b) => (b.id === Number(id) || b.id === id ? { ...b, isDeleted: false } : b));
  localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("blogsUpdated", { detail: updatedList }));
};

/* ==========================================================================
   ORDERS SERVICE
   ========================================================================== */

export const getOrders = async () => {
  return getStoredList(STORAGE_KEYS.ORDERS, ordersData);
};

export const getOrderById = async (id) => {
  const list = await getOrders();
  return list.find((o) => o.orderId === id || o.id === Number(id) || o.id === id || o._id === id) || null;
};

export const createOrder = async (orderData) => {
  const list = getStoredList(STORAGE_KEYS.ORDERS, ordersData);
  const newOrder = {
    ...orderData,
    id: list.length + 1,
    orderId: orderData.orderId || `CL-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newOrder, ...list];
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("ordersUpdated", { detail: updated }));
  return newOrder;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const list = getStoredList(STORAGE_KEYS.ORDERS, ordersData);
  const updatedList = list.map((o) => (o.orderId === orderId || o._id === orderId ? { ...o, status: newStatus } : o));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("ordersUpdated", { detail: updatedList }));
  return updatedList;
};

/* ==========================================================================
   CUSTOMERS SERVICE
   ========================================================================== */

export const getCustomers = async () => {
  return getStoredList(STORAGE_KEYS.CUSTOMERS, customersData);
};

/* ==========================================================================
   SETTINGS SERVICE
   ========================================================================== */

export const getSettings = async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : settingsData;
  } catch (e) {
    return settingsData;
  }
};

export const saveSettings = async (newSettings) => {
  const current = await getSettings();
  const merged = { ...current, ...newSettings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent("settingsUpdated", { detail: merged }));
  return merged;
};

/* ==========================================================================
   MEDIA SERVICE
   ========================================================================== */

export const getMediaList = async () => {
  return getStoredList(STORAGE_KEYS.MEDIA, mediaData);
};

// Initialize on import
initDataStorage();
