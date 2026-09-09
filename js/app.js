/**
 * KK PHARMACY ONLINE PHARMACY - MAIN APPLICATION BOOTSTRAPPER (js/app.js)
 * Initializes universal UI layouts, global modals, AI Assistant, and boots active page controller.
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('💊 Bootstrapping KK PHARMACY Pharmacy System...');

  // 1. Render global Navbar & Footer if present on page
  if (document.getElementById('main-navbar-container')) {
    NavbarComponent.render('main-navbar-container');
  }
  if (document.getElementById('main-footer-container')) {
    FooterComponent.render('main-footer-container');
  }

  // 2. Initialize Login / Register Modal
  App.initAuthModal();

  // 3. Initialize MediMate AI Healthcare Assistant Widget (Google Generative AI)
  if (typeof MediMateChatBot !== 'undefined' && !document.querySelector('.admin-layout')) {
    MediMateChatBot.init();
  }

  // 4. Initialize Active Page Controller
  if (document.getElementById('homepage-main') && typeof HomePage !== 'undefined') {
    await HomePage.init();
  } else if (document.getElementById('products-page-main') && typeof ProductsPage !== 'undefined') {
    await ProductsPage.init();
  } else if (document.getElementById('product-details-main') && typeof ProductDetailsPage !== 'undefined') {
    await ProductDetailsPage.init();
  } else if (document.getElementById('categories-page-main') && typeof CategoriesPage !== 'undefined') {
    await CategoriesPage.init();
  } else if (document.getElementById('cart-page-main') && typeof CartPage !== 'undefined') {
    await CartPage.init();
  } else if (document.getElementById('checkout-page-main') && typeof CheckoutPage !== 'undefined') {
    await CheckoutPage.init();
  } else if (document.getElementById('profile-page-main') && typeof ProfilePage !== 'undefined') {
    await ProfilePage.init();
  } else if (document.getElementById('orders-page-main') && typeof OrdersPage !== 'undefined') {
    await OrdersPage.init();
  } else if (document.getElementById('order-details-main') && typeof OrderDetailsPage !== 'undefined') {
    await OrderDetailsPage.init();
  } else if (document.getElementById('wishlist-page-main') && typeof WishlistPage !== 'undefined') {
    await WishlistPage.init();
  } else if (document.getElementById('admin-dashboard-main') && typeof AdminDashboardPage !== 'undefined') {
    await AdminDashboardPage.init();
  } else if (document.getElementById('admin-products-main') && typeof AdminProductsPage !== 'undefined') {
    await AdminProductsPage.init();
  } else if (document.getElementById('admin-orders-main') && typeof AdminOrdersPage !== 'undefined') {
    await AdminOrdersPage.init();
  } else if (document.getElementById('admin-inventory-main') && typeof AdminInventoryPage !== 'undefined') {
    await AdminInventoryPage.init();
  } else if (document.getElementById('admin-users-main') && typeof AdminUsersPage !== 'undefined') {
    await AdminUsersPage.init();
  } else if (document.getElementById('admin-reports-main') && typeof AdminReportsPage !== 'undefined') {
    await AdminReportsPage.init();
  }
});

const App = {
  /**
   * Universal Auth Modal for Guest Users
   */
  initAuthModal: () => {
    let authModal = document.getElementById('authModal');
    if (!authModal) {
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = `
        <div class="modal fade" id="authModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
              <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold text-navy"><i class="bi bi-shield-lock me-2 text-primary"></i>KK PHARMACY Sign In</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body p-4">
                <form id="modalLoginForm">
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Email or Username</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-envelope"></i></span>
                      <input type="email" id="modalLoginEmail" class="form-control border-start-0 ps-0" placeholder="user@example.com" required value="user@example.com">
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Password</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-key"></i></span>
                      <input type="password" id="modalLoginPassword" class="form-control border-start-0 ps-0" placeholder="••••••••" required value="password123">
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" id="modalRememberMe" checked>
                      <label class="form-check-label small" for="modalRememberMe">Remember me</label>
                    </div>
                    <a href="#" class="small text-primary">Forgot Password?</a>
                  </div>
                  <button type="submit" class="btn btn-primary-pharmacy w-100 py-2 mb-3">
                    <i class="bi bi-box-arrow-in-right"></i> Sign In to Account
                  </button>
                  
                  <div class="p-3 bg-light rounded-3 mb-3 small text-muted text-center">
                    <div><strong>Coursework Demo Credentials:</strong></div>
                    <div class="mt-1">
                      <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2 me-1" onclick="document.getElementById('modalLoginEmail').value='user@example.com';document.getElementById('modalLoginPassword').value='password123';">User Demo</button>
                      <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" onclick="document.getElementById('modalLoginEmail').value='admin@medora.com';document.getElementById('modalLoginPassword').value='admin123';">Admin Demo</button>
                    </div>
                  </div>
                  
                  <div class="text-center small text-muted">
                    Don't have an account yet? <a href="pages/register.html" class="fw-semibold text-primary">Create Account</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalContainer);
      authModal = document.getElementById('authModal');
    }

    const form = document.getElementById('modalLoginForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('modalLoginEmail').value;
        const password = document.getElementById('modalLoginPassword').value;

        try {
          await AuthService.login(email, password);
          const bsModal = bootstrap.Modal.getInstance(authModal);
          if (bsModal) bsModal.hide();
          Toast.show(`Welcome back! Logged in as ${email}`, 'success');
          
          if (AuthService.hasRole('ROLE_ADMIN') && window.location.pathname.includes('admin/')) {
            window.location.reload();
          }
        } catch (err) {
          Toast.show(err.message || 'Login failed', 'error');
        }
      });
    }
  }
};
