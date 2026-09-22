/**
 * KK PHARMACY ONLINE PHARMACY - GLOBAL CONFIGURATION (js/config.js)
 */
const CONFIG = {
  // Spring Boot REST API Base URL
  // API_BASE_URL: 'http://localhost:8080/api/v1',
  API_BASE_URL: 'https://kkpharmacy.onrender.com/api/v1',
  
  // When false: uses real Spring Boot REST API. When true: uses fallback mock data
  USE_MOCK_DATA: false,
  
  // Centralized LocalStorage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'kk_access_token',
    REFRESH_TOKEN: 'kk_refresh_token',
    AUTH_TOKEN: 'kk_access_token', // Alias for backward compatibility
    USER: 'kk_user_info',
    USER_INFO: 'kk_user_info',     // Alias
    ROLE: 'kk_user_role',
    CART_ITEMS: 'kk_cart_items',
    WISHLIST: 'kk_wishlist'
  },
  
  // E-Commerce Settings
  CURRENCY: 'Rs.',
  CURRENCY_CODE: 'LKR',
  FREE_SHIPPING_THRESHOLD: 5000
};

// Freeze configuration object to prevent unintended modifications
Object.freeze(CONFIG);

/**
 * Universal Image Path Resolver:
 * Ensures correct relative paths (e.g. assets/images/ vs ../assets/images/)
 * across root pages and subfolder pages (pages/ and admin/).
 */
function resolveImagePath(imagePath) {
  if (!imagePath) return 'assets/images/medicine_1.png';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  const cleanPath = imagePath.replace(/^(\.\.\/)+/, '');
  const pathname = window.location.pathname.replace(/\\/g, '/');
  const isSubdir = pathname.includes('/pages/') || pathname.includes('/admin/');
  return isSubdir ? `../${cleanPath}` : cleanPath;
}

window.resolveImagePath = resolveImagePath;
