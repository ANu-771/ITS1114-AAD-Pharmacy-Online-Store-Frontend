/**
 * KK PHARMACY ONLINE PHARMACY - USER REST API MODULE
 */
const UserAPI = {
  getProfile: async () => {
    return await apiClient.get('/users/profile');
  },

  updateProfile: async (profileData) => {
    return await apiClient.put('/users/profile', profileData);
  },

  getOrders: async () => {
    return await apiClient.get('/users/orders');
  }
};
