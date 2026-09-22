/**
 * KK PHARMACY ONLINE PHARMACY - PRODUCT DETAILS CONTROLLER (js/pages/product-details.js)
 * Manages dynamic rendering of clinical details, dosage, prescription warning, quantity adjustment, and cart actions.
 */
const ProductDetailsPage = {
  currentProduct: null,

  init: async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id') || 1;

      const product = await ProductService.getProductById(productId);
      if (!product) {
        Toast.show('Product not found.', 'error');
        return;
      }

      ProductDetailsPage.currentProduct = product;
      ProductDetailsPage.renderDetails(product);
      ProductDetailsPage.loadRelatedProducts(product.category, product.id);
      ProductDetailsPage.attachListeners();
    } catch (err) {
      console.error('[ProductDetailsPage] Error:', err);
    }
  },

  renderDetails: (product) => {
    document.title = `${product.name} — KK PHARMACY Digital Pharmacy`;
    
    // Breadcrumb
    const breadcrumb = document.getElementById('detailBreadcrumbTitle');
    if (breadcrumb) breadcrumb.textContent = product.name;

    // Image & Badge
    const mainImg = document.getElementById('detailMainImg');
    const thumb1 = document.getElementById('detailThumb1');
    const badgeEl = document.getElementById('detailBadge');

    const imgSrc = resolveImagePath(product.image);
    const fallbackImg = resolveImagePath('assets/images/medicine_1.png');

    if (mainImg) {
      mainImg.src = imgSrc;
      mainImg.onerror = () => { mainImg.src = fallbackImg; };
    }
    if (thumb1) {
      thumb1.src = imgSrc;
      thumb1.onerror = () => { thumb1.src = fallbackImg; };
    }
    if (badgeEl) badgeEl.textContent = product.badge || 'Certified';

    // Titles & Brand
    document.getElementById('detailTitle').textContent = product.name;
    document.getElementById('detailBrand').textContent = product.brand;
    document.getElementById('detailCategory').textContent = product.categoryName || product.category;

    // Ratings
    document.getElementById('detailRatingVal').textContent = product.rating || '4.8';
    document.getElementById('detailReviewsCount').textContent = `(${product.reviewsCount || 42} verified reviews)`;

    // Price
    document.getElementById('detailPrice').textContent = `Rs. ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const oldPriceEl = document.getElementById('detailOldPrice');
    if (product.oldPrice && product.oldPrice > product.price) {
      oldPriceEl.textContent = `Rs. ${product.oldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    } else {
      oldPriceEl.textContent = '';
    }

    // Stock Units & Availability Status
    const stockQty = typeof product.stock === 'number' ? product.stock : (product.initialStock !== undefined ? product.initialStock : (product.inStock ? 50 : 0));
    const stockBadge = document.getElementById('detailStockBadge');
    const addToCartBtn = document.getElementById('detailAddToCartBtn');
    const qtyInput = document.getElementById('detailQtyInput');

    if (stockBadge) {
      if (stockQty <= 0) {
        stockBadge.className = 'badge bg-danger-subtle text-danger border border-danger-subtle ms-auto';
        stockBadge.innerHTML = '<i class="bi bi-x-circle-fill me-1"></i> Out of Stock';
      } else if (stockQty <= 5) {
        stockBadge.className = 'badge bg-warning-subtle text-warning border border-warning-subtle ms-auto';
        stockBadge.innerHTML = `<i class="bi bi-lightning-charge-fill me-1"></i> Only ${stockQty} left in stock - Order soon`;
      } else {
        stockBadge.className = 'badge bg-success-subtle text-success border border-success-subtle ms-auto';
        stockBadge.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> In Stock (${stockQty} units available)`;
      }
    }

    if (addToCartBtn) {
      if (stockQty <= 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.classList.add('disabled', 'opacity-50');
        addToCartBtn.innerHTML = '<i class="bi bi-slash-circle me-1"></i> Out of Stock';
      } else {
        addToCartBtn.disabled = false;
        addToCartBtn.classList.remove('disabled', 'opacity-50');
        addToCartBtn.innerHTML = '<i class="bi bi-bag-plus me-1"></i> Add to Cart';
      }
    }

    if (qtyInput) {
      qtyInput.max = stockQty > 0 ? stockQty : 1;
      qtyInput.disabled = stockQty <= 0;
    }

    // Prescription warning alert
    const rxAlert = document.getElementById('rxWarningAlert');
    if (product.requiresPrescription) {
      rxAlert.classList.remove('d-none');
      rxAlert.classList.add('d-flex');
    } else {
      rxAlert.classList.add('d-none');
      rxAlert.classList.remove('d-flex');
    }

    // Description & specs
    document.getElementById('detailDescription').textContent = product.description || 'Authentic healthcare product supplied under strict pharmaceutical temperature controls.';
    document.getElementById('specIngredient').textContent = product.activeIngredient || 'Clinical Grade Compound';
    document.getElementById('specStrength').textContent = product.strength || 'Standard Dosage';
    document.getElementById('specForm').textContent = product.dosageForm || 'Unit Packaging';
    document.getElementById('specManufacturer').textContent = product.manufacturer || product.brand;
    document.getElementById('specStorage').textContent = product.storageInfo || 'Store in a cool, dry place away from direct sunlight.';
  },

  loadRelatedProducts: async (category, currentId) => {
    const container = document.getElementById('relatedProductsGrid');
    if (!container) return;

    try {
      const all = await ProductService.getProducts(category);
      const related = all.filter(p => p.id !== currentId).slice(0, 4);

      if (related.length === 0) {
        container.innerHTML = '<div class="col-12 text-muted">No related products found.</div>';
        return;
      }

      let html = '';
      related.forEach(p => {
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
          const prod = await ProductService.getProductById(productId);
          if (!prod) return;

          if (action === 'add-cart') {
            CartService.addToCart(prod, 1);
          } else if (action === 'quickview') {
            Modal.showQuickView(prod);
          } else if (action === 'wishlist') {
            target.classList.toggle('active');
            Toast.show(`Added ${prod.name} to Wishlist!`, 'success');
          }
        });
      }
    } catch (e) {
      console.warn('[ProductDetailsPage] Could not load related products:', e);
    }
  },

  attachListeners: () => {
    const qtyInput = document.getElementById('detailQtyInput');
    const minusBtn = document.getElementById('qtyMinusBtn');
    const plusBtn = document.getElementById('qtyPlusBtn');
    const addCartBtn = document.getElementById('detailAddToCartBtn');
    const wishlistBtn = document.getElementById('detailWishlistBtn');

    if (minusBtn && qtyInput) {
      minusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) qtyInput.value = val - 1;
      });
    }

    if (plusBtn && qtyInput) {
      plusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val < 50) qtyInput.value = val + 1;
      });
    }

    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        if (ProductDetailsPage.currentProduct) {
          CartService.addToCart(ProductDetailsPage.currentProduct, qty);
        }
      });
    }

    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => {
        if (ProductDetailsPage.currentProduct) {
          wishlistBtn.classList.toggle('btn-outline-danger');
          wishlistBtn.classList.toggle('btn-danger');
          Toast.show(`Added ${ProductDetailsPage.currentProduct.name} to Wishlist!`, 'success');
        }
      });
    }
  }
};
