/**
 * KK PHARMACY ONLINE PHARMACY - AUTHENTICATION API MODULE (js/api/auth-api.js)
 * Connects directly to Spring Boot AuthController endpoints (/api/v1/auth/**).
 */
const AuthAPI = {
  /**
   * User login (POST /api/v1/auth/login)
   */
  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  /**
   * User registration (POST /api/v1/auth/register)
   */
  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },

  /**
   * Refresh JWT token (POST /api/v1/auth/refresh-token)
   */
  refreshToken: async (refreshToken) => {
    return await apiClient.post('/auth/refresh-token', {
      refreshToken: refreshToken,
      token: refreshToken
    });
  },

  /**
   * Get current authenticated user summary (GET /api/v1/auth/me)
   */
  getCurrentUser: async () => {
    return await apiClient.get('/auth/me');
  },

  /**
   * User logout (POST /api/v1/auth/logout)
   */
  logout: async () => {
    return await apiClient.post('/auth/logout', {});
  },

  /**
   * Request password reset OTP (POST /api/v1/auth/forgot-password)
   */
  forgotPassword: async (email) => {
    return await apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Verify 6-digit OTP code (POST /api/v1/auth/verify-otp)
   */
  verifyOtp: async (email, otpCode) => {
    return await apiClient.post('/auth/verify-otp', { email, otpCode });
  },

  /**
   * Reset password with OTP (POST /api/v1/auth/reset-password)
   */
  resetPassword: async (email, otpCode, newPassword) => {
    return await apiClient.post('/auth/reset-password', { email, otpCode, newPassword });
  }
};
