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
    const cleanEmail = (email || '').trim();
    const cleanPass = (password || '').trim();

    if (CONFIG.USE_MOCK_DATA) {
      const mockToken = 'mock_jwt_token_kk_pharmacy_' + Date.now();
      const isAdmin = cleanEmail.toLowerCase().includes('admin');
      const mockUser = {
        id: Math.floor(100 + Math.random() * 900),
        fullName: isAdmin 
          ? 'System Administrator' 
          : cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: cleanEmail || 'customer@kkpharmacy.lk',
        phone: '+94 77 123 4567',
        roles: isAdmin ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER'],
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
        email: cleanEmail,
        password: cleanPass
      });

      const token = response.accessToken || response.token;
      const user = response.user || {
        email: cleanEmail,
        fullName: cleanEmail.split('@')[0],
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
    const cleanEmail = (userData.email || '').trim();
    const cleanFullName = (userData.fullName || '').trim();
    const cleanPhone = (userData.phone || '').trim();
    const cleanPassword = (userData.password || '').trim();

    console.log('[AuthService] Registering customer account:', cleanEmail);

    if (CONFIG.USE_MOCK_DATA) {
      const mockToken = 'mock_jwt_token_kk_pharmacy_' + Date.now();
      const mockUser = {
        id: Math.floor(100 + Math.random() * 900),
        fullName: cleanFullName || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: cleanPhone || '',
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
        fullName: cleanFullName,
        email: cleanEmail,
        password: cleanPassword,
        phone: cleanPhone
      };

      const response = await AuthAPI.register(requestPayload);
      console.log('[AuthService] Registration successful:', response);

      const token = response.accessToken || response.token;
      const user = response.user || {
        email: cleanEmail,
        fullName: cleanFullName,
        phone: cleanPhone,
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
