/**
 * KK PHARMACY ONLINE PHARMACY - PRODUCTS CATALOG CONTROLLER (js/pages/products.js)
 * Manages category filters, price range sliders, search filtering, sorting, pagination, and quick views.
 */
const ProductsPage = {
  products: [],
  filteredProducts: [],
  currentCategory: 'all',

  init: async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let categoryParam = urlParams.get('category') || 'all';
      const searchParam = urlParams.get('search') || '';

      // Map numeric category IDs to standard slugs if needed
      categoryParam = ProductsPage._normalizeCategoryParam(categoryParam);
      ProductsPage.currentCategory = categoryParam;

      // Dynamically render sidebar categories
      await ProductsPage.renderCategoryFilters(categoryParam);

      const searchInput = document.getElementById('catalogSearchInput');
      if (searchInput && searchParam) searchInput.value = searchParam;

      await ProductsPage.loadProducts(categoryParam, searchParam);
      ProductsPage.attachListeners();
      ProductsPage.updateBreadcrumb(categoryParam);
    } catch (error) {
      console.error('[ProductsPage] Init error:', error);
    }
  },

  /**
   * Normalize numeric ID or name to slug
   */
  _normalizeCategoryParam: (cat) => {
    if (!cat || cat === 'all') return 'all';
    const clean = String(cat).toLowerCase().trim();
    if (clean === '1' || clean === 'medicines') return 'medicines';
    if (clean === '2' || clean === 'prescription' || clean.includes('rx')) return 'prescription';
    if (clean === '3' || clean === 'equipment' || clean.includes('device')) return 'equipment';
    if (clean === '4' || clean === 'vitamins' || clean.includes('supplement')) return 'vitamins';
    if (clean === '5' || clean === 'personal-care' || clean.includes('personal')) return 'personal-care';
    if (clean === '6' || clean === 'baby-care' || clean.includes('baby')) return 'baby-care';
    if (clean === '7' || clean === 'first-aid' || clean.includes('first')) return 'first-aid';
    return clean;
  },

  /**
   * Dynamically build Category Radio filters in the sidebar
   */
  renderCategoryFilters: async (activeSlug = 'all') => {
    const listContainer = document.getElementById('categoryFilterList');
    if (!listContainer) return;

    try {
      const categories = await ProductService.getCategories();
      let html = `
        <div class="form-check">
          <input class="form-check-input filter-category-radio" type="radio" name="categoryFilter" id="cat-all" value="all" ${activeSlug === 'all' ? 'checked' : ''}>
          <label class="form-check-label small fw-semibold" for="cat-all">All Categories</label>
        </div>
      `;

      categories.forEach(cat => {
        const slug = cat.slug || (typeof cat.id === 'string' && isNaN(cat.id) ? cat.id : 'medicines');
        const isChecked = activeSlug === slug;
        html += `
          <div class="form-check">
            <input class="form-check-input filter-category-radio" type="radio" name="categoryFilter" id="cat-${slug}" value="${slug}" ${isChecked ? 'checked' : ''}>
            <label class="form-check-label small" for="cat-${slug}">
              ${cat.name}
            </label>
          </div>
        `;
      });

      listContainer.innerHTML = html;
    } catch (e) {
      console.warn('[ProductsPage] Could not load dynamic categories for sidebar:', e);
    }
  },

  updateBreadcrumb: (categorySlug) => {
    const breadcrumb = document.getElementById('breadcrumbCategory');
    if (!breadcrumb) return;

    if (!categorySlug || categorySlug === 'all') {
      breadcrumb.textContent = 'All Products Catalog';
      return;
    }

    const titles = {
      'medicines': 'Medicines (OTC & Remedies)',
      'prescription': 'Prescription Medicines (Rx)',
      'equipment': 'Medical Equipment & Devices',
      'vitamins': 'Vitamins & Supplements',
      'personal-care': 'Personal Care & Hygiene',
      'baby-care': 'Baby & Mother Care',
      'first-aid': 'First Aid & Emergency'
    };

    breadcrumb.textContent = titles[categorySlug] || (categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1));
  },

  loadProducts: async (category = 'all', searchQuery = '') => {
    const containerId = 'products-catalog-grid';
    LoadingState.renderProductSkeletons(containerId, 6);

    try {
      let data = await ProductService.getProducts(category);

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        data = data.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.brand.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
        );
      }

      ProductsPage.products = data;
      ProductsPage.applyFilters();
    } catch (err) {
      LoadingState.renderError(containerId, 'Failed to retrieve products from pharmaceutical catalog.');
    }
  },

  applyFilters: () => {
    let result = [...ProductsPage.products];

    // 1. Category Filter
    const selectedRadio = document.querySelector('input[name="categoryFilter"]:checked');
    const selectedCat = selectedRadio ? selectedRadio.value : (ProductsPage.currentCategory || 'all');
    
    ProductsPage.updateBreadcrumb(selectedCat);

    if (selectedCat !== 'all') {
      result = result.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        const pCatName = (p.categoryName || '').toLowerCase().replace(/\s+/g, '-');
        const pIdStr = String(p.categoryId || '');

        if (selectedCat === 'prescription') {
          return p.requiresPrescription === true || p.rxRequired === true || pCat === 'prescription' || pIdStr === '2';
        }
        if (selectedCat === 'medicines') {
          return (pCat === 'medicines' || pCatName === 'medicines' || pIdStr === '1') && pCat !== 'first-aid' && pCat !== 'vitamins' && pCat !== 'equipment';
        }
        if (selectedCat === 'equipment') {
          return (pCat === 'equipment' || pCatName === 'medical-equipment' || pIdStr === '3') && !pCat.includes('vitamin');
        }
        if (selectedCat === 'vitamins') {
          return pCat === 'vitamins' || pCatName === 'vitamins-&-supplements' || pCatName.includes('vitamin') || pIdStr === '4';
        }
        if (selectedCat === 'personal-care') {
          return pCat === 'personal-care' || pCatName === 'personal-care' || pIdStr === '5';
        }
        if (selectedCat === 'baby-care') {
          return pCat === 'baby-care' || pCatName === 'baby-&-mother-care' || pCatName === 'baby-care' || pIdStr === '6';
        }
        if (selectedCat === 'first-aid') {
          return pCat === 'first-aid' || pCatName === 'first-aid' || pIdStr === '7';
        }

        return pCat === selectedCat || pCatName === selectedCat || pIdStr === selectedCat;
      });
    }

    // 2. Search Filter
    const searchVal = document.getElementById('catalogSearchInput')?.value.toLowerCase().trim();
    if (searchVal) {
      result = result.filter(p => p.name.toLowerCase().includes(searchVal) || p.brand.toLowerCase().includes(searchVal));
    }

    // 3. Max Price Filter
    const maxPrice = parseFloat(document.getElementById('priceRangeInput')?.value || 20000);
    result = result.filter(p => p.price <= maxPrice);

    // 4. Rx Only Filter
    const rxOnly = document.getElementById('filterRxOnly')?.checked;
    if (rxOnly) {
      result = result.filter(p => p.requiresPrescription === true || p.rxRequired === true);
    }

    // 5. In Stock Only Filter
    const inStockOnly = document.getElementById('filterInStockOnly')?.checked;
    if (inStockOnly) {
      result = result.filter(p => p.inStock === true);
    }

    // 6. Sorting
    const sortVal = document.getElementById('sortSelect')?.value || 'featured';
    if (sortVal === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortVal === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    ProductsPage.filteredProducts = result;
    ProductsPage.renderGrid();
  },

  renderGrid: () => {
    const container = document.getElementById('products-catalog-grid');
    const countLabel = document.getElementById('productCountLabel');
    if (!container) return;

    if (countLabel) {
      countLabel.textContent = `Showing ${ProductsPage.filteredProducts.length} certified healthcare products`;
    }

    if (ProductsPage.filteredProducts.length === 0) {
      LoadingState.renderEmpty('products-catalog-grid', 'No products found matching your current filter criteria.');
      return;
    }

    let html = '';
    ProductsPage.filteredProducts.forEach(product => {
      html += createProductCard(product);
    });
    container.innerHTML = html;
  },

  attachListeners: () => {
    // 1. Grid Card Click Delegation
    const grid = document.getElementById('products-catalog-grid');
    if (grid && !grid._hasCardActionHandler) {
      grid._hasCardActionHandler = true;
      grid.addEventListener('click', async (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');
        const productId = parseInt(target.getAttribute('data-id'), 10);
        const product = await ProductService.getProductById(productId);

        if (!product) return;

        if (action === 'add-cart') {
          CartService.addToCart(product, 1);
        } else if (action === 'wishlist') {
          target.classList.toggle('active');
          Toast.show(`Added ${product.name} to Wishlist!`, 'success');
        } else if (action === 'quickview' || action === 'view-details') {
          window.location.href = `product-details.html?id=${productId}`;
        }
      });
    }

    // 2. Category Filter delegation on container
    const categoryList = document.getElementById('categoryFilterList');
    if (categoryList) {
      categoryList.addEventListener('change', (e) => {
        if (e.target.matches('.filter-category-radio')) {
          ProductsPage.currentCategory = e.target.value;
          ProductsPage.applyFilters();
        }
      });
    }

    // 3. Price Range Slider
    const priceSlider = document.getElementById('priceRangeInput');
    const priceDisplay = document.getElementById('priceDisplay');
    if (priceSlider && priceDisplay) {
      priceSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value).toLocaleString('en-US');
        priceDisplay.textContent = `Rs. ${val}`;
        ProductsPage.applyFilters();
      });
    }

    // 4. Availability & Rx Checkboxes
    document.getElementById('filterRxOnly')?.addEventListener('change', () => ProductsPage.applyFilters());
    document.getElementById('filterInStockOnly')?.addEventListener('change', () => ProductsPage.applyFilters());

    // 5. Sort Select
    document.getElementById('sortSelect')?.addEventListener('change', () => ProductsPage.applyFilters());

    // 6. Search Input & Reset
    const searchInput = document.getElementById('catalogSearchInput');
    const searchBtn = document.getElementById('catalogSearchBtn');
    if (searchInput) {
      searchInput.addEventListener('input', () => ProductsPage.applyFilters());
    }
    if (searchBtn) {
      searchBtn.addEventListener('click', () => ProductsPage.applyFilters());
    }

    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
      const allRadio = document.querySelector('input[name="categoryFilter"][value="all"]');
      if (allRadio) allRadio.checked = true;
      ProductsPage.currentCategory = 'all';

      if (searchInput) searchInput.value = '';
      if (priceSlider) {
        priceSlider.value = 20000;
        priceDisplay.textContent = 'Rs. 20,000';
      }
      const rxChk = document.getElementById('filterRxOnly');
      if (rxChk) rxChk.checked = false;
      const stockChk = document.getElementById('filterInStockOnly');
      if (stockChk) stockChk.checked = false;
      const sortSel = document.getElementById('sortSelect');
      if (sortSel) sortSel.value = 'featured';

      ProductsPage.applyFilters();
      Toast.show('Filters reset.', 'info');
    });
  }
};

