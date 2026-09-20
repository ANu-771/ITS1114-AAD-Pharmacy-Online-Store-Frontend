/**
 * KK PHARMACY ONLINE PHARMACY - CENTRAL API CLIENT
 * Encapsulates Fetch API requests, headers, JWT authentication, automatic token refresh, and HTTP error handling.
 */
class APIClient {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.isRefreshing = false;
  }

  /**
   * Helper to build request headers with optional JWT bearer token
   */
  _getHeaders(customHeaders = {}, isFormData = false) {
    const headers = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    headers['Accept'] = 'application/json';

    // Merge custom headers
    Object.assign(headers, customHeaders);

    // Retrieve active access token
    const token = StorageService.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN) || 
                  StorageService.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Attempt refreshing the JWT access token using the stored refresh token
   */
  async _attemptTokenRefresh() {
    const refreshToken = StorageService.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ refreshToken, token: refreshToken })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const newAccessToken = data.accessToken || data.token;
      if (newAccessToken) {
        StorageService.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        StorageService.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
        if (data.refreshToken) {
          StorageService.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
        }
        if (data.user) {
          StorageService.setItem(CONFIG.STORAGE_KEYS.USER, data.user);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[APIClient] Token refresh failed:', e.message);
      return false;
    }
  }

  /**
   * Universal fetch execution method with status code handling and single-retry token refresh
   */
  async _request(endpoint, options = {}, isRetry = false) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    
    const config = {
      ...options,
      headers: this._getHeaders(options.headers, isFormData)
    };

    let response;
    try {
      response = await fetch(url, config);
    } catch (networkError) {
      console.warn(`[API Client] Network error reaching ${endpoint}:`, networkError.message);
      throw new Error('Unable to connect to KK PHARMACY server. Please try again.');
    }

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    // 401 Unauthorized - Attempt Token Refresh Once
    if (response.status === 401) {
      if (!isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        const refreshed = await this._attemptTokenRefresh();
        if (refreshed) {
          return this._request(endpoint, options, true);
        }
      }

      // If refresh failed or not applicable, clear session
      StorageService.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      StorageService.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      StorageService.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      StorageService.removeItem(CONFIG.STORAGE_KEYS.USER);
      StorageService.removeItem(CONFIG.STORAGE_KEYS.ROLE);
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw new Error('Your session has expired. Please log in again.');
    }

    // 403 Forbidden
    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }

    // 404 Not Found
    if (response.status === 404) {
      let errorMsg = 'The requested item was not found.';
      try {
        const errJson = await response.json();
        if (errJson && errJson.message) errorMsg = errJson.message;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    // Other non-2xx status codes (400, 500, etc.)
    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.validationErrors) {
          const firstValidation = Object.values(errJson.validationErrors)[0];
          errorMsg = firstValidation || errJson.message || 'Validation failed.';
        } else if (errJson.message) {
          errorMsg = errJson.message;
        }
      } catch (_) {
        if (response.status === 500) {
          errorMsg = 'An unexpected server error occurred. Please try again later.';
        }
      }
      throw new Error(errorMsg);
    }

    // 200 / 201 Success: Parse response JSON
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (parseError) {
      return {};
    }
  }

  /**
   * GET Request
   */
  async get(endpoint, params = {}) {
    let url = endpoint;
    const cleanParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    }
    const queryString = new URLSearchParams(cleanParams).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    return this._request(url, { method: 'GET' });
  }

  /**
   * POST Request
   */
  async post(endpoint, data = {}) {
    const isFormData = data instanceof FormData;
    return this._request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data)
    });
  }

  /**
   * PUT Request
   */
  async put(endpoint, data = {}) {
    const isFormData = data instanceof FormData;
    return this._request(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data)
    });
  }

  /**
   * PATCH Request
   */
  async patch(endpoint, data = {}) {
    return this._request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE Request
   */
  async delete(endpoint) {
    return this._request(endpoint, { method: 'DELETE' });
  }
}

// Global Singleton Instance
const apiClient = new APIClient();
