/**
 * KK PHARMACY ONLINE PHARMACY - CATEGORY REST API MODULE
 */
const CategoryAPI = {
  getAllCategories: async () => {
    return await apiClient.get('/categories');
  },

  getCategoryById: async (id) => {
    return await apiClient.get(`/categories/${id}`);
  }
};
