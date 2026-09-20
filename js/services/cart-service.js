/**
 * KK PHARMACY ONLINE PHARMACY - CART SERVICE (js/services/cart-service.js)
 * Manages shopping cart state, guest LocalStorage persistence, and authenticated Spring Boot Cart API synchronization.
 */
const CartService = {
  _cartItems: [],

  /**
   * Normalize backend CartItemDTO into frontend item structure
   */
  _normalizeItem: (item) => {
    return {
      id: item.productId || item.id,
      cartItemId: item.id, // Backend cart item primary key
      productId: item.productId || item.id,
      name: item.name || item.productName || 'Healthcare Product',
      brand: item.brand || 'KK PHARMACY',
      price: parseFloat(item.price) || 0,
      image: item.image ? item.image.replace(/^(\.\.\/)+/, '') : 'assets/images/medicine_1.png',
      category: item.category || 'general',
      requiresPrescription: !!item.requiresPrescription,
      quantity: parseInt(item.quantity, 10) || 1,
      subtotal: parseFloat(item.subtotal) || ((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1)),
      availableStock: item.availableStock || 99
    };
  },

  /**
   * Get current cart items directly from persistent storage or backend
   */
  getCartItems: () => {
    try {
      const stored = StorageService.getItem(CONFIG.STORAGE_KEYS.CART_ITEMS, []);
      CartService._cartItems = Array.isArray(stored) ? stored : [];
    } catch (e) {
      CartService._cartItems = [];
    }
    return CartService._cartItems;
  },

  /**
   * Fetch latest cart from backend for authenticated users, or local storage for guests
   */
  fetchCart: async () => {
    if (!CONFIG.USE_MOCK_DATA && AuthService.isAuthenticated()) {
      try {
        const cartDto = await CartAPI.getCart();
        if (cartDto && Array.isArray(cartDto.items)) {
          CartService._cartItems = cartDto.items.map(CartService._normalizeItem);
          StorageService.setItem(CONFIG.STORAGE_KEYS.CART_ITEMS, CartService._cartItems);
          window.dispatchEvent(new CustomEvent('cart:updated', {
            detail: {
              count: CartService.getCartCount(),
              subtotal: CartService.getCartSubtotal(),
              items: CartService._cartItems,
              backendData: cartDto
            }
          }));
          return CartService._cartItems;
        }
      } catch (err) {
        console.warn('[CartService] Failed to fetch backend cart, using local cache:', err.message);
      }
    }
    return CartService.getCartItems();
  },

  /**
   * Get total count of units in cart
   */
  getCartCount: () => {
    const items = CartService.getCartItems();
    return items.reduce((acc, item) => acc + (parseInt(item.quantity, 10) || 1), 0);
  },

  /**
   * Calculate cart subtotal
   */
  getCartSubtotal: () => {
    const items = CartService.getCartItems();
    return items.reduce((acc, item) => acc + ((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1)), 0);
  },

  /**
   * Add a product to the cart (Live Spring Boot or Local)
   */
  addToCart: async (product, quantity = 1) => {
    if (!product || (!product.id && !product.productId)) return;
    const prodId = product.productId || product.id;
    const qtyToAdd = parseInt(quantity, 10) || 1;

    // Authenticated Live REST API Integration
    if (!CONFIG.USE_MOCK_DATA && AuthService.isAuthenticated()) {
      try {
        const cartDto = await CartAPI.addToCart(prodId, qtyToAdd);
        if (cartDto && Array.isArray(cartDto.items)) {
          CartService._cartItems = cartDto.items.map(CartService._normalizeItem);
          StorageService.setItem(CONFIG.STORAGE_KEYS.CART_ITEMS, CartService._cartItems);
          window.dispatchEvent(new CustomEvent('cart:updated', {
            detail: {
              count: CartService.getCartCount(),
              subtotal: CartService.getCartSubtotal(),
              items: CartService._cartItems
            }
          }));
          if (typeof Toast !== 'undefined') {
            Toast.show(`${product.name || 'Product'} added to cart!`, 'success');
          }
          return;
        }
      } catch (err) {
        console.warn('[CartService] Live addToCart failed, falling back to local storage:', err.message);
      }
    }

    // Guest / Fallback local cart handling
    const items = CartService.getCartItems();
    const cleanImg = product.image ? product.image.replace(/^(\.\.\/)+/, '') : 'assets/images/medicine_1.png';
    const existingIndex = items.findIndex(i => (i.productId || i.id) === prodId);

    if (existingIndex > -1) {
      items[existingIndex].quantity = (parseInt(items[existingIndex].quantity, 10) || 1) + qtyToAdd;
    } else {
      items.push({
        id: prodId,
        productId: prodId,
        name: product.name,
        brand: product.brand || 'KK PHARMACY',
        price: parseFloat(product.price) || 0,
        image: cleanImg,
        category: product.category || 'general',
        requiresPrescription: !!product.requiresPrescription,
        quantity: qtyToAdd
      });
    }

    CartService._cartItems = items;
    CartService._save();
    if (typeof Toast !== 'undefined') {
      Toast.show(`${product.name || 'Product'} added to cart!`, 'success');
    }
  },

  /**
   * Update quantity of a product in the cart
   */
  updateQuantity: async (productId, quantity) => {
    const newQty = parseInt(quantity, 10);
    if (newQty <= 0) {
      await CartService.removeFromCart(productId);
      return;
    }

    const items = CartService.getCartItems();
    const item = items.find(i => (i.productId || i.id) === productId || i.cartItemId === productId);

    if (!CONFIG.USE_MOCK_DATA && AuthService.isAuthenticated()) {
      try {
        const targetId = (item && item.cartItemId) ? item.cartItemId : productId;
        const cartDto = await CartAPI.updateQuantity(targetId, newQty);
        if (cartDto && Array.isArray(cartDto.items)) {
          CartService._cartItems = cartDto.items.map(CartService._normalizeItem);
          StorageService.setItem(CONFIG.STORAGE_KEYS.CART_ITEMS, CartService._cartItems);
          window.dispatchEvent(new CustomEvent('cart:updated', {
            detail: {
              count: CartService.getCartCount(),
              subtotal: CartService.getCartSubtotal(),
              items: CartService._cartItems
            }
          }));
          return;
        }
      } catch (err) {
        console.warn('[CartService] Live updateQuantity error:', err.message);
      }
    }

    if (item) {
      item.quantity = newQty;
      CartService._cartItems = items;
      CartService._save();
    }
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (productId) => {
    const items = CartService.getCartItems();
    const item = items.find(i => (i.productId || i.id) === productId || i.cartItemId === productId);

    if (!CONFIG.USE_MOCK_DATA && AuthService.isAuthenticated()) {
      try {
        const targetId = (item && item.cartItemId) ? item.cartItemId : productId;
        const cartDto = await CartAPI.removeFromCart(targetId);
        if (cartDto && Array.isArray(cartDto.items)) {
          CartService._cartItems = cartDto.items.map(CartService._normalizeItem);
          StorageService.setItem(CONFIG.STORAGE_KEYS.CART_ITEMS, CartService._cartItems);
          window.dispatchEvent(new CustomEvent('cart:updated', {
            detail: {
              count: CartService.getCartCount(),
              subtotal: CartService.getCartSubtotal(),
              items: CartService._cartItems
            }
          }));
          return;
        }
      } catch (err) {
        console.warn('[CartService] Live removeFromCart error:', err.message);
      }
    }

    CartService._cartItems = items.filter(i => (i.productId || i.id) !== productId && i.cartItemId !== productId);
    CartService._save();
  },

  /**
   * Clear the entire shopping cart
   */
  clearCart: async () => {
    if (!CONFIG.USE_MOCK_DATA && AuthService.isAuthenticated()) {
      try {
        await CartAPI.clearCart().catch(() => {});
      } catch (err) {
        console.warn('[CartService] Clear backend cart error:', err.message);
      }
    }
    CartService._cartItems = [];
    StorageService.setItem(CONFIG.STORAGE_KEYS.CART_ITEMS, []);
    window.dispatchEvent(new CustomEvent('cart:updated', { 
      detail: { count: 0, subtotal: 0, items: [] } 
    }));
  },

  /**
   * Synchronize local guest cart to backend upon login
   */
  syncLocalCartToBackend: async () => {
    if (CONFIG.USE_MOCK_DATA || !AuthService.isAuthenticated()) return;
    const localItems = CartService.getCartItems();
    if (!localItems || localItems.length === 0) {
      await CartService.fetchCart();
      return;
    }

    try {
      for (const item of localItems) {
        const prodId = item.productId || item.id;
        const qty = item.quantity || 1;
        await CartAPI.addToCart(prodId, qty).catch(() => {});
      }
      // Re-fetch merged cart
      await CartService.fetchCart();
    } catch (err) {
      console.warn('[CartService] Cart synchronization error:', err);
    }
  },

  /**
   * Internal persistence helper for guest state
   */
  _save: () => {
    StorageService.setItem(CONFIG.STORAGE_KEYS.CART_ITEMS, CartService._cartItems);
    window.dispatchEvent(new CustomEvent('cart:updated', { 
      detail: { 
        count: CartService.getCartCount(),
        subtotal: CartService.getCartSubtotal(),
        items: CartService._cartItems
      } 
    }));
  }
};
