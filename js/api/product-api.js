/**
 * KK PHARMACY ONLINE PHARMACY - PRODUCT REST API MODULE (js/api/product-api.js)
 * Connects to Spring Boot ProductController endpoints (/api/v1/products/**).
 */
const ProductAPI = {
  /**
   * Fetch paginated and filtered product catalog (GET /api/v1/products)
   */
  getAllProducts: async (params = {}) => {
    return await apiClient.get('/products', params);
  },

  /**
   * Fetch single product details by ID (GET /api/v1/products/{id})
   */
  getProductById: async (id) => {
    return await apiClient.get(`/products/${id}`);
  },

  /**
   * Fetch featured products for homepage (GET /api/v1/products/featured)
   */
  getFeaturedProducts: async () => {
    return await apiClient.get('/products/featured');
  },

  /**
   * Fetch products by Category ID (GET /api/v1/products/category/{categoryId})
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    return await apiClient.get(`/products/category/${categoryId}`, params);
  },

  /**
   * Search products by keyword (GET /api/v1/products/search?q=...)
   */
  searchProducts: async (query) => {
    return await apiClient.get('/products/search', { q: query });
  },

  /**
   * Admin: Create new product (POST /api/v1/products)
   */
  createProduct: async (productData) => {
    return await apiClient.post('/products', productData);
  },

  /**
   * Admin: Update product (PUT /api/v1/products/{id})
   */
  updateProduct: async (id, productData) => {
    return await apiClient.put(`/products/${id}`, productData);
  },

  /**
   * Admin: Delete product (DELETE /api/v1/products/{id})
   */
  deleteProduct: async (id) => {
    return await apiClient.delete(`/products/${id}`);
  }
};
