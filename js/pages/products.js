/**
 * KK PHARMACY ONLINE PHARMACY - PRODUCTS CATALOG CONTROLLER (js/pages/products.js)
 * Manages category filters, price range sliders, search filtering, sorting, pagination, and quick views.
 */
const ProductsPage = {
  products: [],
  filteredProducts: [],

  init: async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get('category') || 'all';
      const searchParam = urlParams.get('search') || '';

      const radio = document.querySelector(`input[name="categoryFilter"][value="${categoryParam}"]`);
      if (radio) radio.checked = true;

      const searchInput = document.getElementById('catalogSearchInput');
      if (searchInput && searchParam) searchInput.value = searchParam;

      await ProductsPage.loadProducts(categoryParam, searchParam);
      ProductsPage.attachListeners();
    } catch (error) {
      console.error('[ProductsPage] Init error:', error);
    }
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
    const selectedCat = document.querySelector('input[name="categoryFilter"]:checked')?.value || 'all';
    if (selectedCat !== 'all') {
      result = result.filter(p => p.category === selectedCat);
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
      result = result.filter(p => p.requiresPrescription === true);
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
    // 1. Grid Card Click Delegation (Attached once)
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
        } else if (action === 'quickview') {
          Modal.showQuickView(product);
        }
      });
    }

    // 2. Category Radios
    document.querySelectorAll('.filter-category-radio').forEach(radio => {
      radio.addEventListener('change', () => {
        ProductsPage.applyFilters();
      });
    });

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
      document.querySelector('input[name="categoryFilter"][value="all"]').checked = true;
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
