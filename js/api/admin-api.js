/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN API MODULE (js/api/admin-api.js)
 * REST API client for Admin Dashboard statistics, low-stock alerts, inventory batches, user management, and report generation.
 */
const AdminAPI = {
  /**
   * Get dashboard KPI metrics
   */
  getDashboardStats: async () => {
    return await apiClient.get('/admin/dashboard-stats');
  },

  /**
   * Get inventory items & low-stock alerts
   */
  getInventory: async () => {
    return await apiClient.get('/admin/inventory');
  },

  /**
   * Add inventory batch
   */
  addBatch: async (batchData) => {
    return await apiClient.post('/admin/inventory/batch', batchData);
  },

  /**
   * Get all registered users
   */
  getUsers: async () => {
    return await apiClient.get('/admin/users');
  },

  /**
   * Update user status (Active/Disabled)
   */
  updateUserStatus: async (userId, enabled) => {
    return await apiClient.patch(`/admin/users/${userId}/status`, { enabled });
  },

  /**
   * Generate sales reports data
   */
  getSalesReport: async (startDate, endDate) => {
    return await apiClient.get('/admin/reports/sales', { startDate, endDate });
  }
};
