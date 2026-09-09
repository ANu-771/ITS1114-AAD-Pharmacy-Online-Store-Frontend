/**
 * KK PHARMACY ONLINE PHARMACY - PRODUCT REST API MODULE
 * Handles fetch, search, filter, and pagination for healthcare products & medical equipment.
 */
const ProductAPI = {
  getAllProducts: async (params = {}) => {
    return await apiClient.get('/products', params);
  },

  getProductById: async (id) => {
    return await apiClient.get(`/products/${id}`);
  },

  getFeaturedProducts: async () => {
    return await apiClient.get('/products/featured');
  },

  getProductsByCategory: async (categoryId, params = {}) => {
    return await apiClient.get(`/products/category/${categoryId}`, params);
  },

  searchProducts: async (query) => {
    return await apiClient.get('/products/search', { q: query });
  }
};
