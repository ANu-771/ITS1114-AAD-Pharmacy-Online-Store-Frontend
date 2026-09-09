/**
 * KK PHARMACY ONLINE PHARMACY - ORDER API MODULE (js/api/order-api.js)
 * REST API client for Order management, checkout submission, user order history, and status updates.
 */
const OrderAPI = {
  /**
   * Create new order
   */
  createOrder: async (orderPayload) => {
    return await apiClient.post('/orders', orderPayload);
  },

  /**
   * Get current authenticated user's orders
   */
  getMyOrders: async () => {
    return await apiClient.get('/orders/my-orders');
  },

  /**
   * Get specific order by ID
   */
  getOrderById: async (orderId) => {
    return await apiClient.get(`/orders/${orderId}`);
  },

  /**
   * Admin: Get all system orders
   */
  getAllOrders: async (params = {}) => {
    return await apiClient.get('/admin/orders', params);
  },

  /**
   * Admin: Update order status (PENDING, PROCESSING, DISPATCHED, DELIVERED, CANCELLED)
   */
  updateOrderStatus: async (orderId, status) => {
    return await apiClient.patch(`/admin/orders/${orderId}/status`, { status });
  }
};
