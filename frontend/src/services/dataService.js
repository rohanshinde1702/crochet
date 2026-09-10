/**
 * @file dataService.js
 * @description Standalone Data Service layer that enables full React template functionality
 * with zero backend required. Automatically synchronizes with localStorage and provides
 * seamless fallback to schema datasets.
 */

import { productsData } from "../data/products";
import { categoriesData } from "../data/categories";
import { blogsData } from "../data/blogs";
import { ordersData } from "../data/orders";
import { customersData } from "../data/customers";
import { settingsData } from "../data/settings";
import { mediaData } from "../data/media";
import { API_ENDPOINTS } from "../config/api";

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
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
};

/* ==========================================================================
   PRODUCTS SERVICE
   ========================================================================== */

export const getProducts = async (includeDeleted = false) => {
  try {
    // Try fetching from API if backend is connected
    const res = await fetch(API_ENDPOINTS.PRODUCTS);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    // Offline / Standalone mode
  }
  const list = getStoredList(STORAGE_KEYS.PRODUCTS, productsData);
  return includeDeleted ? list : list.filter((p) => !p.isDeleted);
};

export const getProductById = async (id) => {
  const numericId = Number(id);
  try {
    const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`);
    if (res.ok) return await res.json();
  } catch (e) {}
  const list = getStoredList(STORAGE_KEYS.PRODUCTS, productsData);
  return list.find((p) => p.id === numericId || p.id === id) || null;
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
  try {
    const res = await fetch(API_ENDPOINTS.CATEGORIES);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  const list = getStoredList(STORAGE_KEYS.CATEGORIES, categoriesData);
  return includeDeleted ? list : list.filter((c) => !c.isDeleted);
};

export const saveCategory = async (catData) => {
  const list = getStoredList(STORAGE_KEYS.CATEGORIES, categoriesData);
  let updatedList;
  if (catData.id || catData._id) {
    updatedList = list.map((c) => (c.id === catData.id || c.name === catData.name ? { ...c, ...catData } : c));
  } else {
    const newCat = {
      ...catData,
      id: list.length + 1,
      slug: catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      isDeleted: false
    };
    updatedList = [...list, newCat];
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("categoriesUpdated", { detail: updatedList }));
  return catData;
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
  try {
    const res = await fetch(API_ENDPOINTS.BLOGS);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  const list = getStoredList(STORAGE_KEYS.BLOGS, blogsData);
  return includeDeleted ? list : list.filter((b) => !b.isDeleted);
};

export const getBlogById = async (id) => {
  try {
    const res = await fetch(`${API_ENDPOINTS.BLOGS}/${id}`);
    if (res.ok) return await res.json();
  } catch (e) {}
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
  try {
    const res = await fetch(API_ENDPOINTS.ORDERS);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  return getStoredList(STORAGE_KEYS.ORDERS, ordersData);
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
  try {
    const res = await fetch(API_ENDPOINTS.CUSTOMERS);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  return getStoredList(STORAGE_KEYS.CUSTOMERS, customersData);
};

/* ==========================================================================
   SETTINGS SERVICE
   ========================================================================== */

export const getSettings = async () => {
  try {
    const res = await fetch(API_ENDPOINTS.SETTINGS);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object") return data;
    }
  } catch (e) {}
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
