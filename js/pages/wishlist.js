/**
 * KK PHARMACY ONLINE PHARMACY - WISHLIST CONTROLLER (js/pages/wishlist.js)
 * Manages saved products, moving items to cart, and removal from wishlist.
 */
const WishlistPage = {
  init: async () => {
    WishlistPage.renderWishlist();
    WishlistPage.attachListeners();

    // Listen to global wishlist update events
    window.addEventListener('wishlist:updated', () => {
      WishlistPage.renderWishlist();
    });
  },

  renderWishlist: () => {
    const container = document.getElementById('wishlistGrid');
    if (!container) return;

    const wishlistItems = typeof WishlistService !== 'undefined' ? WishlistService.getWishlistItems() : [];

    if (!wishlistItems || wishlistItems.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="mb-3">
            <i class="bi bi-heartbreak display-3 text-muted opacity-50"></i>
          </div>
          <h4 class="fw-bold text-navy mb-2">Your Wishlist is Empty</h4>
          <p class="text-muted small mb-4">You haven't saved any medications or devices yet. Click the heart icon on any product to save it here!</p>
          <a href="products.html" class="btn btn-primary-pharmacy px-4 py-2">
            <i class="bi bi-shop me-1"></i> Explore Healthcare Store
          </a>
        </div>
      `;
      return;
    }

    let html = '';
    wishlistItems.forEach(p => {
      html += createProductCard(p);
    });
    container.innerHTML = html;
  },

  attachListeners: () => {
    const container = document.getElementById('wishlistGrid');
    if (container && !container._hasCardActionHandler) {
      container._hasCardActionHandler = true;
      container.addEventListener('click', async (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');
        const productId = parseInt(target.getAttribute('data-id'), 10);
        
        const storedItems = typeof WishlistService !== 'undefined' ? WishlistService.getWishlistItems() : [];
        let item = storedItems.find(i => (parseInt(i.id, 10) === productId || parseInt(i.productId, 10) === productId));
        if (!item && typeof ProductService !== 'undefined') {
          item = await ProductService.getProductById(productId);
        }
        if (!item) return;

        if (action === 'add-cart') {
          CartService.addToCart(item, 1);
        } else if (action === 'wishlist') {
          if (typeof WishlistService !== 'undefined') {
            WishlistService.toggleWishlist(item);
            WishlistPage.renderWishlist();
          }
        } else if (action === 'quickview' || action === 'view-details') {
          window.location.href = `product-details.html?id=${productId}`;
        }
      });
    }
  }
};
