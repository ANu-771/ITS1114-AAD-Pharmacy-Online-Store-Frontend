/**
 * KK PHARMACY ONLINE PHARMACY - CART SERVICE (js/services/cart-service.js)
 * Manages shopping cart state, storage persistence, item addition, quantity updates, and event notifications.
 */
const CartService = {
  _cartItems: [],

  /**
   * Get current cart items directly from persistent storage
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
   * Add a product to the cart
   */
  addToCart: (product, quantity = 1) => {
    if (!product || !product.id) return;
    
    // Always refresh latest state
    const items = CartService.getCartItems();
    const cleanImg = product.image ? product.image.replace(/^(\.\.\/)+/, '') : 'assets/images/medicine_1.png';
    const qtyToAdd = parseInt(quantity, 10) || 1;

    const existingIndex = items.findIndex(i => i.id === product.id);
    if (existingIndex > -1) {
      items[existingIndex].quantity = (parseInt(items[existingIndex].quantity, 10) || 1) + qtyToAdd;
    } else {
      items.push({
        id: product.id,
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
    Toast.show(`${product.name} added to cart!`, 'success');
  },

  /**
   * Update quantity of a product in the cart
   */
  updateQuantity: (productId, quantity) => {
    const newQty = parseInt(quantity, 10);
    if (newQty <= 0) {
      CartService.removeFromCart(productId);
      return;
    }
    const items = CartService.getCartItems();
    const item = items.find(i => i.id === productId);
    if (item) {
      item.quantity = newQty;
      CartService._cartItems = items;
      CartService._save();
    }
  },

  /**
   * Remove item from cart
   */
  removeFromCart: (productId) => {
    const items = CartService.getCartItems();
    CartService._cartItems = items.filter(i => i.id !== productId);
    CartService._save();
  },

  /**
   * Clear the entire shopping cart (e.g. after successful order payment)
   */
  clearCart: () => {
    CartService._cartItems = [];
    StorageService.setItem(CONFIG.STORAGE_KEYS.CART_ITEMS, []);
    window.dispatchEvent(new CustomEvent('cart:updated', { 
      detail: { count: 0, subtotal: 0, items: [] } 
    }));
  },

  /**
   * Internal persistence helper
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
