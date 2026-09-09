/**
 * KK DIGITAL PHARMACY - FLOATING GLASS BUBBLE NAVBAR COMPONENT (js/components/navbar.js)
 * Modern glassmorphism floating pill header with active bubble indicator,
 * dynamic search toggle, cart & wishlist counters, and auth state management.
 */
const NavbarComponent = {
  render: (containerId = 'main-navbar-container') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Detect if current page is in a subdirectory (pages/ or admin/)
    const path = window.location.pathname.replace(/\\/g, '/');
    const isSubdir = path.includes('/pages/') || path.includes('/admin/');
    const p = isSubdir ? '../' : '';

    const user = AuthService.getCurrentUser();
    const isAuthenticated = AuthService.isAuthenticated();
    const isAdmin = AuthService.hasRole('ROLE_ADMIN');
    const cartCount = CartService.getCartCount();

    // Check active links
    const isHome = path.endsWith('index.html') || path.endsWith('/') || (!path.includes('.html') && !path.includes('/pages/'));
    const isProducts = path.includes('products.html') && !window.location.search.includes('medicines') && !window.location.search.includes('equipment') && !window.location.search.includes('vitamins');
    const isMed = path.includes('products.html') && window.location.search.includes('medicines');
    const isEquip = path.includes('products.html') && window.location.search.includes('equipment');
    const isVit = path.includes('products.html') && window.location.search.includes('vitamins');
    const isCategories = path.includes('categories.html');
    const isAbout = path.includes('about.html');
    const isContact = path.includes('contact.html');

    container.innerHTML = `
      <div class="floating-header-wrapper" id="floatingHeaderWrapper">
        <div class="container">
          <nav class="navbar navbar-expand-xl pharmacy-glass-navbar" aria-label="Main Navigation">
            
            <!-- 1. LEFT: Brand & Animated Pills Icon -->
            <a class="navbar-brand navbar-brand-logo" href="${p}index.html" aria-label="KK PHARMACY Home">
              <div class="navbar-brand-pill-wrapper">
                <img src="${p}assets/images/pills_logo.svg" alt="KK PHARMACY Pills Animation" class="brand-pill-anim-img">
                <div class="pill-sparkle-dot dot-1"></div>
                <div class="pill-sparkle-dot dot-2"></div>
              </div>
              <div class="brand-text-block">
                <div class="brand-title">KK PHARMACY</div>
                <small class="brand-tagline d-none d-sm-block">Your Trusted Digital Pharmacy</small>
              </div>
            </a>

            <!-- 2. CENTER: Floating Pill/Bubble Navigation Menu -->
            <div class="collapse navbar-collapse justify-content-center" id="pharmacyNav">
              <div class="nav-bubble-pill-group">
                <ul class="navbar-nav align-items-center">
                  <li class="nav-item">
                    <a class="nav-link nav-bubble ${isHome ? 'active' : ''}" href="${p}index.html">
                      <i class="bi bi-house-door me-1"></i> Home
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link nav-bubble ${isProducts ? 'active' : ''}" href="${p}pages/products.html">
                      <i class="bi bi-grid-fill me-1"></i> Products
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link nav-bubble ${isMed ? 'active' : ''}" href="${p}pages/products.html?category=medicines">
                      <i class="bi bi-capsule me-1"></i> Medicines
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link nav-bubble ${isEquip ? 'active' : ''}" href="${p}pages/products.html?category=equipment">
                      <i class="bi bi-hospital me-1"></i> Equipment
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link nav-bubble ${isCategories ? 'active' : ''}" href="${p}pages/categories.html">
                      <i class="bi bi-collection me-1"></i> Categories
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link nav-bubble ${isAbout ? 'active' : ''}" href="${p}pages/about.html">
                      <i class="bi bi-info-circle me-1"></i> About Us
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link nav-bubble ${isContact ? 'active' : ''}" href="${p}pages/contact.html">
                      <i class="bi bi-telephone me-1"></i> Contact
                    </a>
                  </li>
                  ${isAdmin ? `
                    <li class="nav-item">
                      <a class="nav-link nav-bubble nav-bubble-admin" href="${p}admin/dashboard.html">
                        <i class="bi bi-speedometer2 me-1"></i> Admin Panel
                      </a>
                    </li>
                  ` : ''}
                </ul>
              </div>
            </div>

            <!-- 3. RIGHT: Actions (Search, Wishlist, Cart, Profile / Auth) -->
            <div class="header-actions-group d-flex align-items-center gap-2 ms-auto ms-xl-0">
              
              <!-- Quick Search Bubble -->
              <div class="header-search-wrapper position-relative">
                <button class="header-action-bubble btn-search-toggle" type="button" id="headerSearchToggle" title="Search Medicines & Medical Equipment" aria-label="Search Store">
                  <i class="bi bi-search"></i>
                </button>
                
                <!-- Floating Glass Search Dropdown -->
                <div class="header-search-dropdown shadow-lg" id="headerSearchDropdown">
                  <form action="${p}pages/products.html" method="GET" class="d-flex align-items-center gap-2">
                    <i class="bi bi-search text-primary ms-2"></i>
                    <input type="text" name="search" id="headerSearchInput" class="form-control form-control-sm border-0 bg-transparent" placeholder="Search medicines, equipment..." aria-label="Search store products">
                    <button type="submit" class="btn btn-sm btn-primary-pharmacy rounded-pill px-3 py-1 text-nowrap">Search</button>
                  </form>
                </div>
              </div>

              <!-- Wishlist Bubble -->
              <a href="${p}pages/wishlist.html" class="header-action-bubble position-relative" title="My Wishlist" aria-label="Saved Products Wishlist">
                <i class="bi bi-heart"></i>
                <span class="bubble-badge wishlist-badge-count">4</span>
              </a>

              <!-- Shopping Cart Bubble -->
              <a href="${p}pages/cart.html" class="header-action-bubble position-relative" title="Shopping Cart" aria-label="Shopping Cart">
                <i class="bi bi-bag"></i>
                <span class="bubble-badge cart-badge-count">${cartCount}</span>
              </a>

              <!-- User Profile / Auth State Section -->
              <div id="nav-auth-container" class="ms-1">
                ${isAuthenticated ? `
                  <div class="dropdown">
                    <button class="header-user-bubble dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="User account dropdown">
                      <div class="user-avatar-bubble">
                        <i class="bi bi-person-fill"></i>
                      </div>
                      <span class="d-none d-md-inline fw-semibold text-navy small pe-1">${user.fullName ? user.fullName.split(' ')[0] : 'Account'}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end glass-dropdown-menu shadow-lg border-0 mt-2">
                      <li class="px-3 py-2 border-bottom mb-1">
                        <div class="fw-bold text-navy small">${user.fullName || 'Signed In Patient'}</div>
                        <small class="text-muted" style="font-size: 0.75rem;">${user.email || 'patient@kkpharmacy.lk'}</small>
                      </li>
                      <li><a class="dropdown-item glass-dropdown-item" href="${p}pages/profile.html"><i class="bi bi-person me-2 text-primary"></i>My Healthcare Profile</a></li>
                      <li><a class="dropdown-item glass-dropdown-item" href="${p}pages/orders.html"><i class="bi bi-box-seam me-2 text-primary"></i>My Orders & Prescriptions</a></li>
                      <li><a class="dropdown-item glass-dropdown-item" href="${p}pages/wishlist.html"><i class="bi bi-heart me-2 text-primary"></i>My Wishlist</a></li>
                      ${isAdmin ? `
                        <li><hr class="dropdown-divider my-1"></li>
                        <li><a class="dropdown-item glass-dropdown-item text-danger fw-semibold" href="${p}admin/dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Admin Dashboard</a></li>
                      ` : ''}
                      <li><hr class="dropdown-divider my-1"></li>
                      <li><button class="dropdown-item glass-dropdown-item text-danger btn-logout" type="button"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                    </ul>
                  </div>
                ` : `
                  <button class="btn btn-primary-pharmacy header-login-pill d-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#authModal" aria-label="Sign in to your account">
                    <i class="bi bi-person-circle"></i>
                    <span class="d-none d-sm-inline">Login / Register</span>
                  </button>
                `}
              </div>

              <!-- Mobile Hamburger Toggler Bubble -->
              <button class="navbar-toggler header-action-bubble border-0 d-xl-none" type="button" data-bs-toggle="collapse" data-bs-target="#pharmacyNav" aria-controls="pharmacyNav" aria-expanded="false" aria-label="Toggle navigation">
                <i class="bi bi-list fs-5"></i>
              </button>

            </div>
          </nav>
        </div>
      </div>
    `;

    NavbarComponent._attachListeners(container);
  },

  _attachListeners: (container) => {
    // 1. Search Dropdown Toggle
    const searchToggleBtn = container.querySelector('#headerSearchToggle');
    const searchDropdown = container.querySelector('#headerSearchDropdown');
    const searchInput = container.querySelector('#headerSearchInput');

    if (searchToggleBtn && searchDropdown) {
      searchToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchDropdown.classList.toggle('show');
        if (searchDropdown.classList.contains('show') && searchInput) {
          setTimeout(() => searchInput.focus(), 150);
        }
      });

      // Close search when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-search-wrapper')) {
          searchDropdown.classList.remove('show');
        }
      });
    }

    // 2. Scroll Elevation Effect
    const wrapper = container.querySelector('#floatingHeaderWrapper');
    if (wrapper) {
      const handleScroll = () => {
        if (window.scrollY > 15) {
          wrapper.classList.add('floating-header-scrolled');
        } else {
          wrapper.classList.remove('floating-header-scrolled');
        }
      };
      window.removeEventListener('scroll', NavbarComponent._scrollHandler);
      NavbarComponent._scrollHandler = handleScroll;
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    // 3. Logout Trigger
    const logoutBtn = container.querySelector('.btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        AuthService.logout();
        Toast.show('Logged out successfully.', 'info');
        NavbarComponent.render();
      });
    }

    // 4. Subscribe to Cart updates
    window.addEventListener('cart:updated', (e) => {
      const badgeElements = document.querySelectorAll('.cart-badge-count');
      badgeElements.forEach(badge => {
        badge.textContent = e.detail.count;
      });
    });

    // 5. Subscribe to Auth state updates
    window.addEventListener('auth:state-changed', () => {
      NavbarComponent.render();
    });
  }
};

