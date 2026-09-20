/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN REST API MODULE (js/api/admin-api.js)
 * Connects directly to Spring Boot AdminController and InventoryController endpoints (/api/v1/admin/**).
 */
const AdminAPI = {
  /**
   * Get executive KPI metrics (GET /api/v1/admin/dashboard-stats)
   */
  getDashboardStats: async () => {
    return await apiClient.get('/admin/dashboard-stats');
  },

  /**
   * Get full pharmaceutical inventory list (GET /api/v1/admin/inventory)
   */
  getInventory: async () => {
    return await apiClient.get('/admin/inventory');
  },

  /**
   * Get low-stock inventory items (GET /api/v1/admin/inventory/low-stock)
   */
  getLowStock: async () => {
    return await apiClient.get('/admin/inventory/low-stock');
  },

  /**
   * Inward stock intake / Add inventory batch (POST /api/v1/admin/inventory/batch)
   */
  addBatch: async (batchData) => {
    return await apiClient.post('/admin/inventory/batch', batchData);
  },

  /**
   * Get batches for specific product (GET /api/v1/admin/inventory/product/{productId}/batches)
   */
  getProductBatches: async (productId) => {
    return await apiClient.get(`/admin/inventory/product/${productId}/batches`);
  },

  /**
   * Get all registered user accounts (GET /api/v1/admin/users)
   */
  getUsers: async () => {
    return await apiClient.get('/admin/users');
  },

  /**
   * Update user status (Active / Disabled) (PATCH /api/v1/admin/users/{userId}/status)
   */
  updateUserStatus: async (userId, enabled) => {
    const payload = typeof enabled === 'boolean' 
      ? { enabled, status: enabled ? 'ACTIVE' : 'DISABLED' }
      : { enabled: enabled === 'ACTIVE', status: enabled };
    return await apiClient.patch(`/admin/users/${userId}/status`, payload);
  },

  /**
   * Generate sales & revenue reports (GET /api/v1/admin/reports/sales)
   */
  getSalesReport: async (startDate, endDate) => {
    return await apiClient.get('/admin/reports/sales', {
      startDate: startDate || undefined,
      endDate: endDate || undefined
    });
  }
};
