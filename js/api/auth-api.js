/**
 * KK PHARMACY ONLINE PHARMACY - AUTHENTICATION API MODULE
 * Integrates with Spring Boot JWT auth endpoints (/auth/login, /auth/register, /auth/me)
 */
const AuthAPI = {
  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },

  getCurrentUser: async () => {
    return await apiClient.get('/auth/me');
  },

  refreshToken: async (token) => {
    return await apiClient.post('/auth/refresh', { token });
  }
};
