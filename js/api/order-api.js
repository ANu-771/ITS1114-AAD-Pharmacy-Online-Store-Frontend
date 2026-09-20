/**
 * KK PHARMACY ONLINE PHARMACY - ORDER REST API MODULE (js/api/order-api.js)
 * Connects directly to Spring Boot OrderController and Admin order endpoints (/api/v1/orders/**).
 */
const OrderAPI = {
  /**
   * Create and place a new order (POST /api/v1/orders)
   */
  createOrder: async (orderPayload) => {
    return await apiClient.post('/orders', orderPayload);
  },

  /**
   * Get current authenticated user's order history (GET /api/v1/orders/my-orders)
   */
  getMyOrders: async () => {
    return await apiClient.get('/orders/my-orders');
  },

  /**
   * Get specific order details by ID (GET /api/v1/orders/{id})
   */
  getOrderById: async (orderId) => {
    return await apiClient.get(`/orders/${orderId}`);
  },

  /**
   * Admin/Pharmacist: Get all system orders with pagination (GET /api/v1/admin/orders)
   */
  getAllOrders: async (params = {}) => {
    return await apiClient.get('/admin/orders', params);
  },

  /**
   * Admin/Pharmacist: Update order status (PATCH /api/v1/admin/orders/{id}/status)
   */
  updateOrderStatus: async (orderId, status, trackingId = null) => {
    const payload = { status };
    if (trackingId) payload.trackingId = trackingId;
    return await apiClient.patch(`/admin/orders/${orderId}/status`, payload);
  }
};
