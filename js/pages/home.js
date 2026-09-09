/**
 * KK PHARMACY ONLINE PHARMACY - HOMEPAGE CONTROLLER (js/pages/home.js)
 * Manages interactive hero showcase/auto-slideshow, category loading, 
 * featured product tabs, dynamic search, prescription modal & interactions.
 */
const HomePage = {
  activeCategory: 'all',
  
  // Hero Showcase Slideshow State
  heroShowcase: {
    currentIndex: 0,
    totalSlides: 4,
    intervalMs: 4500,
    timer: null,
    isHovered: false
  },

  init: async () => {
    try {
      HomePage.initHeroShowcase();
      await HomePage.loadCategories();
      await HomePage.loadFeaturedProducts('all');
      HomePage.attachEventListeners();
    } catch (error) {
      console.error('[HomePage] Initialization error:', error);
    }
  },

  /**
   * Initialize the Hero Interactive Showcase & Auto-Slideshow
   */
  initHeroShowcase: () => {
    const showcase = document.getElementById('heroShowcase');
    if (!showcase) return;

    const slides = showcase.querySelectorAll('.hero-slide-card');
    const thumbs = showcase.querySelectorAll('.hero-thumb-card');
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');
    HomePage.heroShowcase.totalSlides = slides.length;

    const goToSlide = (index) => {
      if (index < 0) index = HomePage.heroShowcase.totalSlides - 1;
      if (index >= HomePage.heroShowcase.totalSlides) index = 0;
      
      HomePage.heroShowcase.currentIndex = index;

      // Update slide cards
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      // Update thumbnail cards & progress
      thumbs.forEach((thumb, i) => {
        const fill = thumb.querySelector('.thumb-progress-fill');
        if (i === index) {
          thumb.classList.add('active');
          if (fill) {
            fill.style.transition = 'none';
            fill.style.width = '0%';
            // Trigger reflow to restart animation
            void fill.offsetWidth;
            fill.style.transition = `width ${HomePage.heroShowcase.intervalMs}ms linear`;
            fill.style.width = '100%';
          }
        } else {
          thumb.classList.remove('active');
          if (fill) {
            fill.style.transition = 'none';
            fill.style.width = '0%';
          }
        }
      });
    };

    const startTimer = () => {
      clearInterval(HomePage.heroShowcase.timer);
      goToSlide(HomePage.heroShowcase.currentIndex);

      HomePage.heroShowcase.timer = setInterval(() => {
        if (!HomePage.heroShowcase.isHovered) {
          goToSlide(HomePage.heroShowcase.currentIndex + 1);
        }
      }, HomePage.heroShowcase.intervalMs);
    };

    // Pause timer on hover, resume on mouse leave
    showcase.addEventListener('mouseenter', () => {
      HomePage.heroShowcase.isHovered = true;
      const activeFill = showcase.querySelector('.hero-thumb-card.active .thumb-progress-fill');
      if (activeFill) {
        activeFill.style.animationPlayState = 'paused';
      }
    });

    showcase.addEventListener('mouseleave', () => {
      HomePage.heroShowcase.isHovered = false;
    });

    // Thumbnail Click handlers
    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.getAttribute('data-index'), 10);
        goToSlide(idx);
        startTimer();
      });
    });

    // Arrow controls
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(HomePage.heroShowcase.currentIndex - 1);
        startTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(HomePage.heroShowcase.currentIndex + 1);
        startTimer();
      });
    }

    // Start auto slideshow
    startTimer();
  },

  /**
   * Load and render quick categories
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
          document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' });
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
   * Attach global homepage listeners (Search, Tags, Newsletter, Prescription Modal)
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

    const handleSearch = async (overrideQuery) => {
      const query = (typeof overrideQuery === 'string') ? overrideQuery : (searchInput ? searchInput.value.trim() : '');
      if (!query || query.length === 0) {
        Toast.show('Please enter a medicine or equipment name (e.g. Paracetamol, Omron)', 'warning');
        return;
      }

      if (searchInput) searchInput.value = query;

      LoadingState.renderProductSkeletons('featured-products-grid', 4);
      const results = await ProductService.searchProducts(query);
      const container = document.getElementById('featured-products-grid');
      if (!container) return;

      if (results.length === 0) {
        LoadingState.renderEmpty('featured-products-grid', `No products found matching "${query}".`);
      } else {
        let html = '';
        results.forEach(p => { html += createProductCard(p); });
        container.innerHTML = html;
        Toast.show(`Found ${results.length} result(s) for "${query}".`, 'info');
      }
      
      document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (searchBtn) searchBtn.addEventListener('click', () => handleSearch());
    if (searchInput) {
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
      });
    }

    // Trending Search Tag Pills
    document.querySelectorAll('.hero-tag-pill').forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-query');
        handleSearch(query);
      });
    });

    // 3. Tab buttons
    document.querySelectorAll('.product-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        HomePage.filterProducts(cat);
      });
    });

    // 4. Quick Action Prescription Upload Modal
    const rxBtn = document.getElementById('quickPrescriptionBtn');
    if (rxBtn) {
      rxBtn.addEventListener('click', () => {
        const modalEl = document.getElementById('prescriptionUploadModal');
        if (modalEl) {
          const bsModal = new bootstrap.Modal(modalEl);
          bsModal.show();
        }
      });
    }

    // Quick Action AI Pharmacist Trigger
    const aiBtn = document.getElementById('quickAiConsultBtn');
    if (aiBtn) {
      aiBtn.addEventListener('click', () => {
        if (typeof ChatBot !== 'undefined' && ChatBot.toggle) {
          ChatBot.toggle();
        } else {
          Toast.show('MediMate AI Pharmacist is ready in the bottom right corner!', 'info');
        }
      });
    }

    // Prescription Dropzone & Form
    const rxDropzone = document.getElementById('rxDropzone');
    const rxFileInput = document.getElementById('rxFileInput');
    const rxFileName = document.getElementById('rxFileName');
    const rxFilePreview = document.getElementById('rxFilePreview');
    const rxForm = document.getElementById('prescriptionUploadForm');

    if (rxDropzone && rxFileInput) {
      rxDropzone.addEventListener('click', () => rxFileInput.click());
      rxFileInput.addEventListener('change', () => {
        if (rxFileInput.files && rxFileInput.files[0]) {
          if (rxFileName) rxFileName.textContent = rxFileInput.files[0].name;
          if (rxFilePreview) rxFilePreview.classList.remove('d-none');
        }
      });
    }

    if (rxForm) {
      rxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('rxPatientName')?.value;
        const phone = document.getElementById('rxPhone')?.value;
        
        Toast.show(`Prescription submitted successfully for ${name}! Our pharmacist will contact you at ${phone}.`, 'success');
        
        const modalEl = document.getElementById('prescriptionUploadModal');
        if (modalEl) {
          const bsModal = bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }
        rxForm.reset();
        if (rxFilePreview) rxFilePreview.classList.add('d-none');
      });
    }

    // 5. Newsletter submit
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
