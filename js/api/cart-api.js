/**
 * KK PHARMACY ONLINE PHARMACY - CART REST API MODULE (js/api/cart-api.js)
 * Connects directly to Spring Boot CartController endpoints (/api/v1/cart/**).
 */
const CartAPI = {
  /**
   * Get authenticated user's cart (GET /api/v1/cart)
   */
  getCart: async () => {
    return await apiClient.get('/cart');
  },

  /**
   * Add item to backend cart (POST /api/v1/cart/items)
   */
  addToCart: async (productId, quantity = 1) => {
    return await apiClient.post('/cart/items', { 
      productId: Number(productId), 
      quantity: Number(quantity) 
    });
  },

  /**
   * Update quantity of cart item (PUT /api/v1/cart/items/{id})
   */
  updateQuantity: async (itemId, quantity) => {
    return await apiClient.put(`/cart/items/${itemId}`, { 
      quantity: Number(quantity) 
    });
  },

  /**
   * Remove item from cart (DELETE /api/v1/cart/items/{id})
   */
  removeFromCart: async (itemId) => {
    return await apiClient.delete(`/cart/items/${itemId}`);
  },

  /**
   * Clear user's entire cart (DELETE /api/v1/cart)
   */
  clearCart: async () => {
    return await apiClient.delete('/cart');
  }
};
