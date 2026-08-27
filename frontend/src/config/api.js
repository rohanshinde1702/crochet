// Centralized API configuration powered by frontend environment variables (.env)
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Ensure base URL doesn't have a trailing slash
export const API_BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

// Standard API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/api/products`,
  BLOGS: `${API_BASE_URL}/api/blogs`,
  AUTH: `${API_BASE_URL}/api/auth`,
  CONTACTS: `${API_BASE_URL}/api/contacts`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  CUSTOMERS: `${API_BASE_URL}/api/customers`,
  SETTINGS: `${API_BASE_URL}/api/settings`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
};

// Helper for static backend assets
export const getAssetUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export default API_BASE_URL;
