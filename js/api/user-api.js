/**
 * KK PHARMACY ONLINE PHARMACY - USER REST API MODULE (js/api/user-api.js)
 * Connects to Spring Boot UserController endpoints (/api/v1/users/**).
 */
const UserAPI = {
  /**
   * Get current authenticated user profile (GET /api/v1/users/profile)
   */
  getProfile: async () => {
    return await apiClient.get('/users/profile');
  },

  /**
   * Update user profile (PUT /api/v1/users/profile)
   */
  updateProfile: async (profileData) => {
    return await apiClient.put('/users/profile', profileData);
  },

  /**
   * Get user order history (GET /api/v1/users/orders)
   */
  getOrders: async () => {
    return await apiClient.get('/users/orders');
  }
};
