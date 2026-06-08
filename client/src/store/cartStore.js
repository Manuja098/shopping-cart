import { create } from 'zustand';
import api from '../services/api';

const useCartStore = create((set, get) => ({
  items:     [],
  total:     0,
  itemCount: 0,
  loading:   false,

  // Fetch cart from server
  fetchCart: async () => {
    try {
      const res = await api.get('/cart');
      const { items, total, itemCount } = res.data.data;
      set({ items, total, itemCount });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    set({ loading: true });
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      const { items, total, itemCount, sessionId } = res.data;

      // Save session ID for guest cart
      if (sessionId && !localStorage.getItem('token')) {
        localStorage.setItem('sessionId', sessionId);
      }

      set({ items: res.data.data.items, total: res.data.data.total, itemCount: res.data.data.itemCount, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.message || 'Failed to add to cart' };
    }
  },

  // Update item quantity
  updateItem: async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      set({ items: res.data.data.items, total: res.data.data.total, itemCount: res.data.data.itemCount });
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  },

  // Remove item
  removeItem: async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      set({ items: res.data.data.items, total: res.data.data.total, itemCount: res.data.data.itemCount });
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({ items: [], total: 0, itemCount: 0 });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  },

  // Merge guest cart after login
  mergeCart: async (sessionId) => {
    try {
      const res = await api.post('/cart/merge', { sessionId });
      if (res.data.data) {
        set({ items: res.data.data.items, total: res.data.data.total, itemCount: res.data.data.itemCount });
      }
      localStorage.removeItem('sessionId');
    } catch (error) {
      console.error('Failed to merge cart:', error);
    }
  },

  // Reset cart state locally
  resetCart: () => set({ items: [], total: 0, itemCount: 0 }),
}));

export default useCartStore;