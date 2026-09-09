/**
 * KK PHARMACY ONLINE PHARMACY - CART REST API MODULE
 * Connects to Spring Boot backend cart endpoints (/cart, /cart/add, etc.)
 */
const CartAPI = {
  getCart: async () => {
    return await apiClient.get('/cart');
  },

  addToCart: async (productId, quantity = 1) => {
    return await apiClient.post('/cart/items', { productId, quantity });
  },

  updateQuantity: async (itemId, quantity) => {
    return await apiClient.put(`/cart/items/${itemId}`, { quantity });
  },

  removeFromCart: async (itemId) => {
    return await apiClient.delete(`/cart/items/${itemId}`);
  },

  clearCart: async () => {
    return await apiClient.delete('/cart');
  }
};
