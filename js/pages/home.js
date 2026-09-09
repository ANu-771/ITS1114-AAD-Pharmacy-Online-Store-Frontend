/**
 * KK PHARMACY ONLINE PHARMACY - HOMEPAGE CONTROLLER (js/pages/home.js)
 * Manages category loading, featured product tabs, dynamic search, quick views, and user interactions.
 */
const HomePage = {
  activeCategory: 'all',

  init: async () => {
    try {
      await HomePage.loadCategories();
      await HomePage.loadFeaturedProducts('all');
      HomePage.attachEventListeners();
    } catch (error) {
      console.error('[HomePage] Initialization error:', error);
    }
  },

  /**
   * Load and render 6 quick categories
   */
  loadCategories: async () => {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    try {
      const categories = await ProductService.getCategories();
      let html = '';
      categories.forEach(cat => {
        html += createCategoryCard(cat);
      });
      container.innerHTML = html;

      // Add click listener to category cards
      container.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
          const categoryId = card.getAttribute('data-category');
          HomePage.filterProducts(categoryId);
        });
      });
    } catch (err) {
      console.error('[HomePage] Failed to load categories:', err);
    }
  },

  /**
   * Load featured products with filter tab
   */
  loadFeaturedProducts: async (category = 'all') => {
    HomePage.activeCategory = category;
    const containerId = 'featured-products-grid';
    
    // Show skeleton loaders
    LoadingState.renderProductSkeletons(containerId, 4);

    try {
      const products = await ProductService.getProducts(category);
      const container = document.getElementById(containerId);
      if (!container) return;
      
      if (!products || products.length === 0) {
        LoadingState.renderEmpty(containerId, `No healthcare products available in category "${category}".`);
        return;
      }

      let html = '';
      products.slice(0, 8).forEach(product => {
        html += createProductCard(product);
      });
      container.innerHTML = html;
    } catch (err) {
      LoadingState.renderError(containerId, 'Failed to connect to pharmaceutical server. Please try again later.');
    }
  },

  /**
   * Filter featured products by tab
   */
  filterProducts: (category) => {
    const tabs = document.querySelectorAll('.product-filter-btn');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-category') === category) {
        tab.classList.add('btn-primary-pharmacy');
        tab.classList.remove('btn-outline-pharmacy');
      } else {
        tab.classList.remove('btn-primary-pharmacy');
        tab.classList.add('btn-outline-pharmacy');
      }
    });

    HomePage.loadFeaturedProducts(category);
  },

  /**
   * Attach global homepage listeners (Search bar, Newsletter, Tabs, Card Clicks)
   */
  attachEventListeners: () => {
    // 1. Featured Grid Card Actions (Attached once via delegation)
    const featuredGrid = document.getElementById('featured-products-grid');
    if (featuredGrid && !featuredGrid._hasCardActionHandler) {
      featuredGrid._hasCardActionHandler = true;
      featuredGrid.addEventListener('click', async (e) => {
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

    // 2. Search input enter key & button
    const searchBtn = document.getElementById('heroSearchBtn');
    const searchInput = document.getElementById('heroSearchInput');

    const handleSearch = async () => {
      const query = searchInput ? searchInput.value.trim() : '';
      if (query.length === 0) {
        Toast.show('Please enter a search keyword (e.g. Paracetamol, Omron, Blood Pressure)', 'warning');
        return;
      }

      LoadingState.renderProductSkeletons('featured-products-grid', 4);
      const results = await ProductService.searchProducts(query);
      const container = document.getElementById('featured-products-grid');
      if (!container) return;

      if (results.length === 0) {
        LoadingState.renderEmpty('featured-products-grid', `No products found for "${query}".`);
      } else {
        let html = '';
        results.forEach(p => { html += createProductCard(p); });
        container.innerHTML = html;
        Toast.show(`Found ${results.length} result(s) for "${query}".`, 'info');
      }
      
      document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (searchInput) {
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
      });
    }

    // 3. Tab buttons
    document.querySelectorAll('.product-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        HomePage.filterProducts(cat);
      });
    });

    // 4. Newsletter submit
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        if (email) {
          Toast.show('Thank you for subscribing to KK PHARMACY Healthcare updates!', 'success');
          newsletterForm.reset();
        }
      });
    }
  }
};
