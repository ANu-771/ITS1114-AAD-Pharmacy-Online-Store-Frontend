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

  // Stock availability calculation
  const stockQty = typeof product.stock === 'number' ? product.stock : (product.initialStock !== undefined ? product.initialStock : (product.inStock ? 35 : 0));
  let stockBadgeHtml = '';
  if (stockQty <= 0) {
    stockBadgeHtml = `<div class="product-stock-indicator stock-out"><i class="bi bi-x-circle-fill"></i> Out of Stock</div>`;
  } else if (stockQty <= 8) {
    stockBadgeHtml = `<div class="product-stock-indicator stock-low"><i class="bi bi-lightning-charge-fill"></i> Only ${stockQty} left in stock</div>`;
  } else {
    stockBadgeHtml = `<div class="product-stock-indicator stock-available"><i class="bi bi-check-circle-fill"></i> In Stock (${stockQty} available)</div>`;
  }

  // Calculate relative details page link based on current directory
  const path = window.location.pathname.replace(/\\/g, '/');
  const isSubdir = path.includes('/pages/') || path.includes('/admin/');
  const detailsUrl = isSubdir ? `product-details.html?id=${product.id}` : `pages/product-details.html?id=${product.id}`;

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

        <!-- Product Image (Direct Full Window Page Navigation) -->
        <a href="${detailsUrl}" class="product-img-wrapper" title="View Full Specifications: ${product.name}">
          <img src="${resolvedImg}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
        </a>

        <!-- Product Details -->
        <div class="product-body">
          <div class="product-brand">${product.brand}</div>
          <h6 class="product-title">
            <a href="${detailsUrl}" class="text-navy text-decoration-none" title="View Full Clinical & Product Details">${product.name}</a>
          </h6>
          
          <!-- Rating -->
          <div class="product-rating">
            <i class="bi bi-star-fill"></i>
            <span>${product.rating}</span>
            <span class="reviews-count">(${product.reviewsCount})</span>
          </div>

          <!-- Stock Availability Indicator -->
          ${stockBadgeHtml}

          <!-- Price & Old Price -->
          <div class="product-price-row">
            <span class="product-price">${formattedPrice}</span>
            ${formattedOldPrice ? `<span class="product-old-price">${formattedOldPrice}</span>` : ''}
          </div>

          <!-- Add to Cart CTA -->
          <button class="btn-add-cart ${stockQty <= 0 ? 'btn-out-of-stock disabled' : ''}" data-action="add-cart" data-id="${product.id}" ${stockQty <= 0 ? 'disabled' : ''}>
            <i class="bi ${stockQty <= 0 ? 'bi-slash-circle' : 'bi-cart-plus'}"></i> ${stockQty <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  `;
}
