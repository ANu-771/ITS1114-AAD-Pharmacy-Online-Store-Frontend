/**
 * KK PHARMACY ONLINE PHARMACY - REUSABLE PRODUCT CARD COMPONENT (js/components/product-card.js)
 * Returns clean HTML string representing a product card with bulletproof image path resolution.
 */
function createProductCard(product) {
  const formattedPrice = `Rs. ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formattedOldPrice = product.oldPrice 
    ? `Rs. ${product.oldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
    : null;

  const resolvedImg = resolveImagePath(product.image);
  const fallbackImg = resolveImagePath('assets/images/medicine_1.png');

  return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
      <div class="product-card" data-id="${product.id}">
        <!-- Badge Group -->
        <div class="product-badge-group">
          ${product.badge ? `<span class="badge badge-pharmacy badge-light-blue">${product.badge}</span>` : ''}
          ${product.requiresPrescription ? `<span class="badge badge-pharmacy badge-warning-soft"><i class="bi bi-file-earmark-medical me-1"></i>Rx Required</span>` : ''}
        </div>

        <!-- Wishlist Button -->
        <button class="product-wishlist-btn" title="Add to Wishlist" data-action="wishlist" data-id="${product.id}">
          <i class="bi bi-heart"></i>
        </button>

        <!-- Product Image -->
        <div class="product-img-wrapper" data-action="quickview" data-id="${product.id}" style="cursor: pointer;">
          <img src="${resolvedImg}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
        </div>

        <!-- Product Details -->
        <div class="product-body">
          <div class="product-brand">${product.brand}</div>
          <h6 class="product-title" data-action="quickview" data-id="${product.id}" style="cursor: pointer;">${product.name}</h6>
          
          <!-- Rating -->
          <div class="product-rating">
            <i class="bi bi-star-fill"></i>
            <span>${product.rating}</span>
            <span class="reviews-count">(${product.reviewsCount})</span>
          </div>

          <!-- Price & Old Price -->
          <div class="product-price-row">
            <span class="product-price">${formattedPrice}</span>
            ${formattedOldPrice ? `<span class="product-old-price">${formattedOldPrice}</span>` : ''}
          </div>

          <!-- Add to Cart CTA -->
          <button class="btn-add-cart" data-action="add-cart" data-id="${product.id}">
            <i class="bi bi-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}
