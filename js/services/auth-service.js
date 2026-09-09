/**
 * KK PHARMACY ONLINE PHARMACY - AUTHENTICATION SERVICE
 * Manages user session state, JWT tokens, and role-based client routing flags.
 */
const AuthService = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = StorageService.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  },

  /**
   * Get current stored token
   */
  getToken: () => {
    return StorageService.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Get current user object
   */
  getCurrentUser: () => {
    return StorageService.getItem(CONFIG.STORAGE_KEYS.USER_INFO, {
      fullName: 'Guest User',
      email: '',
      roles: ['ROLE_GUEST']
    });
  },

  /**
   * Check if current user has a specific role (e.g. 'ROLE_ADMIN')
   */
  hasRole: (role) => {
    const user = AuthService.getCurrentUser();
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  },

  /**
   * Login method
   */
  login: async (email, password) => {
    if (CONFIG.USE_MOCK_DATA) {
      // Mock login response
      const mockToken = 'mock_jwt_token_medora_pharmacy_' + Date.now();
      const mockUser = {
        id: 101,
        fullName: 'Dr. Sarah Perera',
        email: email || 'sarah.p@example.com',
        roles: email.includes('admin') ? ['ROLE_USER', 'ROLE_ADMIN'] : ['ROLE_USER']
      };

      StorageService.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, mockToken);
      StorageService.setItem(CONFIG.STORAGE_KEYS.USER_INFO, mockUser);
      window.dispatchEvent(new CustomEvent('auth:state-changed', { detail: { user: mockUser } }));
      return { token: mockToken, user: mockUser };
    }

    try {
      const response = await AuthAPI.login({ email, password });
      StorageService.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.token);
      StorageService.setItem(CONFIG.STORAGE_KEYS.USER_INFO, response.user);
      window.dispatchEvent(new CustomEvent('auth:state-changed', { detail: { user: response.user } }));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout method
   */
  logout: () => {
    StorageService.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    StorageService.removeItem(CONFIG.STORAGE_KEYS.USER_INFO);
    window.dispatchEvent(new CustomEvent('auth:state-changed', { detail: { user: null } }));
  }
};
