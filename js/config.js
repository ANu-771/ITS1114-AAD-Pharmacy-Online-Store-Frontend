/**
 * KK PHARMACY ONLINE PHARMACY - GLOBAL CONFIGURATION (js/config.js)
 */
const CONFIG = {
  // Spring Boot REST API Base URL
  API_BASE_URL: 'http://localhost:8080/api/v1',
  
  // Set to true to use rich realistic mock data when Spring Boot backend is offline
  USE_MOCK_DATA: true,
  
  // LocalStorage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'medora_jwt_token',
    USER_INFO: 'medora_user_info',
    CART_ITEMS: 'medora_cart_items',
    WISHLIST: 'medora_wishlist'
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
