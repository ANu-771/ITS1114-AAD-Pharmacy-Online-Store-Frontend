/**
 * KK PHARMACY ONLINE PHARMACY - AUTHENTICATION SERVICE (js/services/auth-service.js)
 * Manages user session state, JWT tokens, Spring Boot auth integration, and role checking.
 */
const AuthService = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = StorageService.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN) ||
                  StorageService.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  },

  /**
   * Get current stored access token
   */
  getToken: () => {
    return StorageService.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN) ||
           StorageService.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Get current stored refresh token
   */
  getRefreshToken: () => {
    return StorageService.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Get current user object
   */
  getCurrentUser: () => {
    return StorageService.getItem(CONFIG.STORAGE_KEYS.USER, null) ||
           StorageService.getItem(CONFIG.STORAGE_KEYS.USER_INFO, {
             id: null,
             fullName: 'Guest User',
             email: '',
             roles: ['ROLE_GUEST']
           });
  },

  /**
   * Check if current user has a specific role (e.g. 'ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_USER')
   */
  hasRole: (role) => {
    const user = AuthService.getCurrentUser();
    if (!user) return false;
    const roles = user.roles || (user.role ? [user.role] : []);
    return Array.isArray(roles) && roles.includes(role);
  },

  /**
   * Login method
   */
  login: async (email, password) => {
    if (CONFIG.USE_MOCK_DATA) {
      const mockToken = 'mock_jwt_token_kk_pharmacy_' + Date.now();
      const mockUser = {
        id: 101,
        fullName: email.includes('admin') ? 'System Administrator' : 'Sarah Perera',
        email: email || 'user@example.com',
        phone: '+94 77 123 4567',
        roles: email.includes('admin') ? ['ROLE_USER', 'ROLE_ADMIN'] : ['ROLE_USER'],
        enabled: true
      };

      StorageService.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, mockToken);
      StorageService.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, mockToken);
      StorageService.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, 'mock_refresh_' + Date.now());
      StorageService.setItem(CONFIG.STORAGE_KEYS.USER, mockUser);
      StorageService.setItem(CONFIG.STORAGE_KEYS.USER_INFO, mockUser);
      StorageService.setItem(CONFIG.STORAGE_KEYS.ROLE, mockUser.roles[0]);

      window.dispatchEvent(new CustomEvent('auth:state-changed', { detail: { user: mockUser } }));
      return { token: mockToken, accessToken: mockToken, user: mockUser, roles: mockUser.roles };
    }

    try {
      const response = await AuthAPI.login({
        email: email.trim(),
        password: password.trim()
      });

      const token = response.accessToken || response.token;
      const user = response.user || {
        email: email,
        fullName: email.split('@')[0],
        roles: response.roles || ['ROLE_USER']
      };
      if (response.roles && (!user.roles || user.roles.length === 0)) {
        user.roles = response.roles;
      }

      StorageService.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, token);
      StorageService.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
      if (response.refreshToken) {
        StorageService.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
      StorageService.setItem(CONFIG.STORAGE_KEYS.USER, user);
      StorageService.setItem(CONFIG.STORAGE_KEYS.USER_INFO, user);
      const primaryRole = (user.roles && user.roles.length > 0) ? user.roles[0] : 'ROLE_USER';
      StorageService.setItem(CONFIG.STORAGE_KEYS.ROLE, primaryRole);

      window.dispatchEvent(new CustomEvent('auth:state-changed', { detail: { user } }));

      // Synchronize local guest cart to backend if items exist
      if (typeof CartService !== 'undefined' && typeof CartService.syncLocalCartToBackend === 'function') {
        CartService.syncLocalCartToBackend().catch(err => console.warn('[AuthService] Cart sync warning:', err));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register method
   */
  register: async (userData) => {
    console.log('[AuthService] Registering user with data:', userData);
    if (CONFIG.USE_MOCK_DATA) {
      const mockToken = 'mock_jwt_token_kk_pharmacy_' + Date.now();
      const mockUser = {
        id: Math.floor(100 + Math.random() * 900),
        fullName: userData.fullName || 'Registered Customer',
        email: userData.email,
        phone: userData.phone || '',
        roles: ['ROLE_USER'],
        enabled: true
      };

      StorageService.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, mockToken);
      StorageService.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, mockToken);
      StorageService.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, 'mock_refresh_' + Date.now());
      StorageService.setItem(CONFIG.STORAGE_KEYS.USER, mockUser);
      StorageService.setItem(CONFIG.STORAGE_KEYS.USER_INFO, mockUser);
      StorageService.setItem(CONFIG.STORAGE_KEYS.ROLE, 'ROLE_USER');

      window.dispatchEvent(new CustomEvent('auth:state-changed', { detail: { user: mockUser } }));
      return { token: mockToken, accessToken: mockToken, user: mockUser, roles: ['ROLE_USER'] };
    }

    try {
      const requestPayload = {
        fullName: userData.fullName ? userData.fullName.trim() : '',
        email: userData.email ? userData.email.trim() : '',
        password: userData.password ? userData.password.trim() : '',
        phone: userData.phone ? userData.phone.trim() : ''
      };

      const response = await AuthAPI.register(requestPayload);
      console.log('[AuthService] Registration successful:', response);
      alert('Registration successful! Please check your email for verification.');

      const token = response.accessToken || response.token;
      const user = response.user || {
        email: requestPayload.email,
        fullName: requestPayload.fullName,
        phone: requestPayload.phone,
        roles: response.roles || ['ROLE_USER']
      };
      if (response.roles && (!user.roles || user.roles.length === 0)) {
        user.roles = response.roles;
      }

      if (token) {
        StorageService.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, token);
        StorageService.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
        if (response.refreshToken) {
          StorageService.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        }
        StorageService.setItem(CONFIG.STORAGE_KEYS.USER, user);
        StorageService.setItem(CONFIG.STORAGE_KEYS.USER_INFO, user);
        StorageService.setItem(CONFIG.STORAGE_KEYS.ROLE, 'ROLE_USER');
      }

      window.dispatchEvent(new CustomEvent('auth:state-changed', { detail: { user } }));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout method
   */
  logout: async () => {
    try {
      if (!CONFIG.USE_MOCK_DATA && AuthService.isAuthenticated()) {
        await AuthAPI.logout().catch(() => {});
      }
    } finally {
      StorageService.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      StorageService.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      StorageService.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      StorageService.removeItem(CONFIG.STORAGE_KEYS.USER);
      StorageService.removeItem(CONFIG.STORAGE_KEYS.USER_INFO);
      StorageService.removeItem(CONFIG.STORAGE_KEYS.ROLE);
      window.dispatchEvent(new CustomEvent('auth:state-changed', { detail: { user: null } }));
    }
  }
};
