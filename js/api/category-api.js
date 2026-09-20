/**
 * KK PHARMACY ONLINE PHARMACY - CATEGORY REST API MODULE (js/api/category-api.js)
 * Connects to Spring Boot CategoryController endpoints (/api/v1/categories/**).
 */
const CategoryAPI = {
  /**
   * Get all categories (GET /api/v1/categories)
   */
  getAllCategories: async () => {
    return await apiClient.get('/categories');
  },

  /**
   * Get category by ID (GET /api/v1/categories/{id})
   */
  getCategoryById: async (id) => {
    return await apiClient.get(`/categories/${id}`);
  },

  /**
   * Admin: Create category (POST /api/v1/categories)
   */
  createCategory: async (categoryData) => {
    return await apiClient.post('/categories', categoryData);
  },

  /**
   * Admin: Update category (PUT /api/v1/categories/{id})
   */
  updateCategory: async (id, categoryData) => {
    return await apiClient.put(`/categories/${id}`, categoryData);
  },

  /**
   * Admin: Delete category (DELETE /api/v1/categories/{id})
   */
  deleteCategory: async (id) => {
    return await apiClient.delete(`/categories/${id}`);
  }
};
