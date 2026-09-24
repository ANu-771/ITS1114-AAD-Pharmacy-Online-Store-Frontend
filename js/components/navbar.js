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
    const cartCount = typeof CartService !== 'undefined' ? CartService.getCartCount() : 0;
    const wishlistCount = typeof WishlistService !== 'undefined' ? WishlistService.getWishlistCount() : 0;

    // Compute initials for professional profile circle avatar
    let initials = 'U';
    if (user && user.fullName) {
      const parts = user.fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      } else if (parts[0].length >= 2) {
        initials = parts[0].substring(0, 2).toUpperCase();
      } else {
        initials = parts[0][0].toUpperCase();
      }
    } else if (user && user.email) {
      initials = user.email.substring(0, 2).toUpperCase();
    }

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
          
          <!-- =========================================================
               TIER 1: TOP MAIN NAVBAR (BRAND + ACTIONS + AUTH)
               ========================================================= -->
          <nav class="navbar pharmacy-main-navbar d-flex align-items-center justify-content-between" aria-label="Top Brand Navigation">
            
            <!-- LEFT: Brand & Animated Pills Icon -->
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

            <!-- RIGHT: Actions (Search, Wishlist, Cart, Profile / Auth, Mobile Toggle) -->
            <div class="header-actions-group d-flex align-items-center gap-2">
              
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
                <span class="bubble-badge wishlist-badge-count">${wishlistCount}</span>
              </a>

              <!-- Shopping Cart Bubble -->
              <a href="${p}pages/cart.html" class="header-action-bubble position-relative" title="Shopping Cart" aria-label="Shopping Cart">
                <i class="bi bi-bag"></i>
                <span class="bubble-badge cart-badge-count">${cartCount}</span>
              </a>

              ${isAdmin ? `
                <!-- Admin Quick Switch Pill for Store Administrators -->
                <a href="${p}admin/dashboard.html" class="header-admin-pill d-none d-sm-inline-flex align-items-center gap-1" title="Go to Admin Dashboard" aria-label="Admin Dashboard">
                  <i class="bi bi-speedometer2"></i>
                  <span>Admin</span>
                </a>
              ` : ''}

              <!-- User Profile / Auth State Section (Professional Web Store Circle Avatar) -->
              <div id="nav-auth-container" class="ms-1">
                ${isAuthenticated ? `
                  <div class="dropdown">
                    <button class="header-user-bubble dropdown-toggle" type="button" id="headerUserDropdownBtn" data-bs-toggle="dropdown" data-bs-offset="0,10" aria-expanded="false" aria-label="User account dropdown">
                      <div class="user-avatar-bubble">
                        ${initials}
                      </div>
                      <span class="d-none d-md-inline fw-semibold text-navy small pe-1">${user.fullName ? user.fullName.split(' ')[0] : 'Account'}</span>
                      <i class="bi bi-chevron-down user-bubble-chevron ms-1"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end glass-dropdown-menu shadow-lg border-0 mt-2" aria-labelledby="headerUserDropdownBtn">
                      <!-- User Info Header Card -->
                      <li class="dropdown-user-header">
                        <div class="d-flex align-items-center gap-2">
                          <div class="user-avatar-circle-lg">
                            ${initials}
                          </div>
                          <div class="user-info-text overflow-hidden">
                            <div class="d-flex align-items-center gap-1">
                              <span class="fw-bold text-navy text-truncate small">${user.fullName || 'Signed In User'}</span>
                              ${isAdmin ? '<span class="badge-role-admin">ADMIN</span>' : '<span class="badge-role-patient">PATIENT</span>'}
                            </div>
                            <div class="text-muted text-truncate" style="font-size: 0.73rem;">${user.email || 'patient@kkpharmacy.lk'}</div>
                          </div>
                        </div>
                      </li>

                      ${isAdmin ? `
                        <!-- Admin Control Center Launch Card -->
                        <li class="px-1 my-1">
                          <a class="dropdown-item glass-dropdown-item admin-quick-card d-flex align-items-center justify-content-between p-2 rounded-3" href="${p}admin/dashboard.html">
                            <div class="d-flex align-items-center gap-2">
                              <div class="admin-quick-icon-circle">
                                <i class="bi bi-speedometer2"></i>
                              </div>
                              <div>
                                <div class="fw-bold text-danger small">Admin Dashboard</div>
                                <div class="text-muted" style="font-size: 0.69rem;">Store & Inventory Management</div>
                              </div>
                            </div>
                            <i class="bi bi-chevron-right text-danger small"></i>
                          </a>
                        </li>
                        <li><hr class="dropdown-divider my-1"></li>
                      ` : ''}

                      <li><a class="dropdown-item glass-dropdown-item" href="${p}pages/profile.html"><i class="bi bi-person-badge me-2 text-primary"></i>My Healthcare Profile</a></li>
                      <li><a class="dropdown-item glass-dropdown-item" href="${p}pages/orders.html"><i class="bi bi-box-seam me-2 text-primary"></i>My Orders & Prescriptions</a></li>
                      <li><a class="dropdown-item glass-dropdown-item" href="${p}pages/wishlist.html"><i class="bi bi-heart me-2 text-primary"></i>My Wishlist</a></li>
                      <li><hr class="dropdown-divider my-1"></li>
                      <li><button class="dropdown-item glass-dropdown-item text-danger btn-logout d-flex align-items-center gap-2" type="button"><i class="bi bi-box-arrow-right"></i><span>Logout</span></button></li>
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
              <button class="header-action-bubble border-0 d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#floatingCapsuleNavCollapse" aria-controls="floatingCapsuleNavCollapse" aria-expanded="false" aria-label="Toggle navigation">
                <i class="bi bi-list fs-5"></i>
              </button>

            </div>
          </nav>

          <!-- =========================================================
               TIER 2: CENTERED FLOATING CAPSULE / BUBBLE NAVBAR
               ========================================================= -->
          <div class="floating-capsule-nav-container d-flex justify-content-center collapse d-lg-flex" id="floatingCapsuleNavCollapse">
            <nav class="floating-capsule-navbar" aria-label="Category and Page Navigation">
              <ul class="capsule-nav-list d-flex align-items-center list-unstyled m-0 p-0">
                <li class="capsule-nav-item">
                  <a class="capsule-nav-link ${isHome ? 'active' : ''}" href="${p}index.html">
                    <i class="bi bi-house-door-fill"></i>
                    <span>Home</span>
                  </a>
                </li>
                <li class="capsule-nav-item">
                  <a class="capsule-nav-link ${isProducts ? 'active' : ''}" href="${p}pages/products.html">
                    <i class="bi bi-grid-fill"></i>
                    <span>Products</span>
                  </a>
                </li>
                <li class="capsule-nav-item">
                  <a class="capsule-nav-link ${isMed ? 'active' : ''}" href="${p}pages/products.html?category=medicines">
                    <i class="bi bi-capsule"></i>
                    <span>Medicines</span>
                  </a>
                </li>
                <li class="capsule-nav-item">
                  <a class="capsule-nav-link ${isEquip ? 'active' : ''}" href="${p}pages/products.html?category=equipment">
                    <i class="bi bi-hospital"></i>
                    <span>Equipment</span>
                  </a>
                </li>
                <li class="capsule-nav-item">
                  <a class="capsule-nav-link ${isCategories ? 'active' : ''}" href="${p}pages/categories.html">
                    <i class="bi bi-collection"></i>
                    <span>Categories</span>
                  </a>
                </li>
                <li class="capsule-nav-item">
                  <a class="capsule-nav-link ${isAbout ? 'active' : ''}" href="${p}pages/about.html">
                    <i class="bi bi-info-circle"></i>
                    <span>About Us</span>
                  </a>
                </li>
                <li class="capsule-nav-item">
                  <a class="capsule-nav-link ${isContact ? 'active' : ''}" href="${p}pages/contact.html">
                    <i class="bi bi-telephone"></i>
                    <span>Contact</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

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
        badge.textContent = e.detail.count !== undefined ? e.detail.count : 0;
      });
    });

    // 5. Subscribe to Wishlist updates
    window.addEventListener('wishlist:updated', (e) => {
      const badgeElements = document.querySelectorAll('.wishlist-badge-count');
      badgeElements.forEach(badge => {
        badge.textContent = e.detail.count !== undefined ? e.detail.count : 0;
      });
    });

    // 6. Subscribe to Auth state updates
    window.addEventListener('auth:state-changed', () => {
      NavbarComponent.render();
    });
  }
};

