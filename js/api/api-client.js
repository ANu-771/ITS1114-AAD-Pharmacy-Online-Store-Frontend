/**
 * KK PHARMACY ONLINE PHARMACY - CENTRAL API CLIENT
 * Encapsulates Fetch API requests, headers, JWT authentication, and HTTP error handling.
 */
class APIClient {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
  }

  /**
   * Helper to build request headers with optional JWT bearer token
   */
  _getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };

    const token = StorageService.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Universal fetch execution method
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this._getHeaders(options.headers)
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        StorageService.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        StorageService.removeItem(CONFIG.STORAGE_KEYS.USER_INFO);
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        throw new Error('Session expired or unauthorized. Please sign in again.');
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error('Forbidden: You do not have permission to access this resource.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error ${response.status}: ${response.statusText}`);
      }

      // If empty response
      if (response.status === 24) return null;

      return await response.json();
    } catch (error) {
      console.warn(`[API Client] Request to ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  /**
   * GET Request
   */
  async get(endpoint, params = {}) {
    let url = endpoint;
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    return this._request(url, { method: 'GET' });
  }

  /**
   * POST Request
   */
  async post(endpoint, data = {}) {
    return this._request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT Request
   */
  async put(endpoint, data = {}) {
    return this._request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
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

// Singleton instance
const apiClient = new APIClient();
