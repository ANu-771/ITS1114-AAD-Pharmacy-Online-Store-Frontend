/**
 * KK PHARMACY ONLINE PHARMACY - WISHLIST SERVICE (js/services/wishlist-service.js)
 * Manages user-isolated and guest saved wishlist items and synchronizes across all components.
 */
const WishlistService = {
  _wishlistItems: [],

  /**
   * Derive user-scoped storage key so each account and guest maintains an independent wishlist
   */
  _getStorageKey: () => {
    try {
      if (typeof AuthService !== 'undefined' && AuthService.isAuthenticated()) {
        const user = AuthService.getCurrentUser();
        if (user && (user.email || user.id)) {
          const userIdentifier = (user.email || user.id).toString().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
          return `${CONFIG.STORAGE_KEYS.WISHLIST}_${userIdentifier}`;
        }
      }
    } catch (e) {
      console.warn('[WishlistService] Error getting user storage key:', e);
    }
    return `${CONFIG.STORAGE_KEYS.WISHLIST}_guest`;
  },

  /**
   * Get all saved wishlist items for current active user/guest from persistent storage
   */
  getWishlistItems: () => {
    try {
      const key = WishlistService._getStorageKey();
      const stored = StorageService.getItem(key, []);
      WishlistService._wishlistItems = Array.isArray(stored) ? stored : [];
    } catch (e) {
      WishlistService._wishlistItems = [];
    }
    return WishlistService._wishlistItems;
  },

  /**
   * Get total count of saved wishlist items for active user/guest
   */
  getWishlistCount: () => {
    return WishlistService.getWishlistItems().length;
  },

  /**
   * Check if a product ID exists in the active user's wishlist
   */
  isInWishlist: (productId) => {
    if (!productId) return false;
    const id = parseInt(productId, 10);
    const items = WishlistService.getWishlistItems();
    return items.some(item => (parseInt(item.id, 10) === id || parseInt(item.productId, 10) === id));
  },

  /**
   * Toggle product in active user's wishlist (Add if absent, Remove if present)
   */
  toggleWishlist: (product) => {
    if (!product || (!product.id && !product.productId)) return false;
    const prodId = parseInt(product.productId || product.id, 10);
    const items = WishlistService.getWishlistItems();
    const existingIndex = items.findIndex(i => (parseInt(i.id, 10) === prodId || parseInt(i.productId, 10) === prodId));

    let added = false;
    if (existingIndex > -1) {
      items.splice(existingIndex, 1);
      if (typeof Toast !== 'undefined') {
        Toast.show(`Removed ${product.name || 'Product'} from Wishlist`, 'info');
      }
    } else {
      const cleanImg = product.image ? product.image.replace(/^(\.\.\/)+/, '') : 'assets/images/medicine_1.png';
      items.push({
        id: prodId,
        productId: prodId,
        name: product.name || 'Healthcare Product',
        brand: product.brand || 'KK PHARMACY',
        price: parseFloat(product.price) || 0,
        oldPrice: product.oldPrice ? parseFloat(product.oldPrice) : null,
        image: cleanImg,
        badge: product.badge || null,
        category: product.category || 'general',
        rating: product.rating || 4.8,
        reviewsCount: product.reviewsCount || 12,
        stock: product.stock !== undefined ? product.stock : (product.initialStock !== undefined ? product.initialStock : 35),
        inStock: product.inStock !== undefined ? product.inStock : true,
        requiresPrescription: !!product.requiresPrescription
      });
      added = true;
      if (typeof Toast !== 'undefined') {
        Toast.show(`Added ${product.name || 'Product'} to Wishlist!`, 'success');
      }
    }

    WishlistService._wishlistItems = items;
    const key = WishlistService._getStorageKey();
    StorageService.setItem(key, items);
    window.dispatchEvent(new CustomEvent('wishlist:updated', {
      detail: {
        count: items.length,
        items: items,
        productId: prodId,
        added: added
      }
    }));
    return added;
  },

  /**
   * Add a product to active user's wishlist
   */
  addToWishlist: (product) => {
    if (!product || (!product.id && !product.productId)) return;
    const prodId = parseInt(product.productId || product.id, 10);
    const items = WishlistService.getWishlistItems();
    const exists = items.some(i => (parseInt(i.id, 10) === prodId || parseInt(i.productId, 10) === prodId));

    if (!exists) {
      const cleanImg = product.image ? product.image.replace(/^(\.\.\/)+/, '') : 'assets/images/medicine_1.png';
      items.push({
        id: prodId,
        productId: prodId,
        name: product.name || 'Healthcare Product',
        brand: product.brand || 'KK PHARMACY',
        price: parseFloat(product.price) || 0,
        oldPrice: product.oldPrice ? parseFloat(product.oldPrice) : null,
        image: cleanImg,
        badge: product.badge || null,
        category: product.category || 'general',
        rating: product.rating || 4.8,
        reviewsCount: product.reviewsCount || 12,
        stock: product.stock !== undefined ? product.stock : 35,
        inStock: product.inStock !== undefined ? product.inStock : true,
        requiresPrescription: !!product.requiresPrescription
      });
      WishlistService._wishlistItems = items;
      const key = WishlistService._getStorageKey();
      StorageService.setItem(key, items);
      window.dispatchEvent(new CustomEvent('wishlist:updated', {
        detail: { count: items.length, items: items, productId: prodId, added: true }
      }));
      if (typeof Toast !== 'undefined') {
        Toast.show(`Added ${product.name || 'Product'} to Wishlist!`, 'success');
      }
    }
  },

  /**
   * Remove item from active user's wishlist
   */
  removeFromWishlist: (productId) => {
    const prodId = parseInt(productId, 10);
    const items = WishlistService.getWishlistItems().filter(i => (parseInt(i.id, 10) !== prodId && parseInt(i.productId, 10) !== prodId));
    WishlistService._wishlistItems = items;
    const key = WishlistService._getStorageKey();
    StorageService.setItem(key, items);
    window.dispatchEvent(new CustomEvent('wishlist:updated', {
      detail: { count: items.length, items: items, productId: prodId, added: false }
    }));
  },

  /**
   * Clear active user's wishlist items
   */
  clearWishlist: () => {
    WishlistService._wishlistItems = [];
    const key = WishlistService._getStorageKey();
    StorageService.setItem(key, []);
    window.dispatchEvent(new CustomEvent('wishlist:updated', {
      detail: { count: 0, items: [] }
    }));
  }
};

// Automatically switch wishlist when user logs in or logs out
window.addEventListener('auth:state-changed', () => {
  const items = WishlistService.getWishlistItems();
  window.dispatchEvent(new CustomEvent('wishlist:updated', {
    detail: { count: items.length, items: items }
  }));
});
