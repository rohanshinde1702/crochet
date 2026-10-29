// import { API_ENDPOINTS } from "../config/api";

// Helper to save and sync cart/wishlist to localStorage and MongoDB for logged in user
export const saveCart = (cartItems) => {
  localStorage.setItem("cart", JSON.stringify(cartItems));

  // Save user-scoped backup in localStorage
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      localStorage.setItem(`user_cart_${user.id}`, JSON.stringify(cartItems));
    }
  } catch (e) {}



  window.dispatchEvent(new Event("cartUpdated"));
};

export const saveWishlist = (wishlistItems) => {
  localStorage.setItem("wishlist", JSON.stringify(wishlistItems));

  // Save user-scoped backup in localStorage
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      localStorage.setItem(`user_wishlist_${user.id}`, JSON.stringify(wishlistItems));
    }
  } catch (e) {}



  window.dispatchEvent(new Event("wishlistUpdated"));
};

export const syncWithDB = async (cart, wishlist) => {
  if (cart !== undefined) saveCart(cart);
  if (wishlist !== undefined) saveWishlist(wishlist);
};
