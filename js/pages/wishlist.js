/**
 * KK PHARMACY ONLINE PHARMACY - WISHLIST CONTROLLER (js/pages/wishlist.js)
 * Manages saved products, moving items to cart, and removal from wishlist.
 */
const WishlistPage = {
  init: async () => {
    const container = document.getElementById('wishlistGrid');
    if (!container) return;

    try {
      // Mock saved products
      const all = await ProductService.getProducts('all');
      const wishlistItems = all.slice(0, 4);

      if (wishlistItems.length === 0) {
        container.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="bi bi-heartbreak display-3 text-muted opacity-50 mb-3"></i>
            <h4 class="fw-bold text-navy">Your Wishlist is Empty</h4>
            <p class="text-muted small mb-4">You haven't saved any medications or devices yet.</p>
            <a href="products.html" class="btn btn-primary-pharmacy px-4 py-2">Explore Healthcare Store</a>
          </div>
        `;
        return;
      }

      let html = '';
      wishlistItems.forEach(p => {
        html += createProductCard(p);
      });
      container.innerHTML = html;

      if (!container._hasCardActionHandler) {
        container._hasCardActionHandler = true;
        container.addEventListener('click', async (e) => {
          const target = e.target.closest('[data-action]');
          if (!target) return;

          const action = target.getAttribute('data-action');
          const productId = parseInt(target.getAttribute('data-id'), 10);
          const item = await ProductService.getProductById(productId);
          if (!item) return;

          if (action === 'add-cart') {
            CartService.addToCart(item, 1);
          } else if (action === 'quickview') {
            Modal.showQuickView(item);
          }
        });
      }
    } catch (e) {
      console.error('[WishlistPage] Error:', e);
    }
  }
};
