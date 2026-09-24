/**
 * KK PHARMACY ONLINE PHARMACY - MAIN APPLICATION BOOTSTRAPPER (js/app.js)
 * Initializes universal UI layouts, global modals, AI Assistant, and boots active page controller.
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('💊 Bootstrapping KK PHARMACY Pharmacy System...');

  // 0. Strict Server Connectivity Gate (Verify backend is online before booting UI)
  if (typeof ServerGate !== 'undefined') {
    const isOnline = await ServerGate.verify();
    if (!isOnline) {
      console.warn('⛔ [App] Server is offline. Halting application boot.');
      return;
    }
  }

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
  } else if (document.getElementById('register-page-main') && typeof RegisterPage !== 'undefined') {
    RegisterPage.init();
  } else if (document.getElementById('login-page-main') && typeof LoginPage !== 'undefined') {
    LoginPage.init();
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
                <!-- Professional Inline Error Alert -->
                <div class="alert alert-danger py-2 px-3 small rounded-3 d-none align-items-center gap-2 mb-3" id="modalLoginErrorAlert" role="alert">
                  <i class="bi bi-exclamation-octagon-fill text-danger fs-5 flex-shrink-0"></i>
                  <div class="flex-grow-1" id="modalLoginErrorText">Invalid email or password. Please try again.</div>
                </div>

                <form id="modalLoginForm">
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Email or Username</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-envelope"></i></span>
                      <input type="email" id="modalLoginEmail" class="form-control border-start-0 ps-0" placeholder="name@example.com" required autocomplete="username">
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label small fw-semibold">Password</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-key"></i></span>
                      <input type="password" id="modalLoginPassword" class="form-control border-start-0 ps-0" placeholder="Enter your password" required autocomplete="current-password">
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" id="modalRememberMe" checked>
                      <label class="form-check-label small" for="modalRememberMe">Remember me</label>
                    </div>
                    <a href="#" class="small text-primary text-decoration-none">Forgot Password?</a>
                  </div>
                  <button type="submit" class="btn btn-primary-pharmacy w-100 py-2 mb-3" id="modalLoginSubmitBtn">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Sign In to Account
                  </button>
                  
                  <div class="text-center small text-muted pt-2 border-top">
                    Don't have an account yet? <a href="${window.location.pathname.includes('/pages/') ? 'register.html' : 'pages/register.html'}" class="fw-bold text-primary text-decoration-none">Create an Account</a>
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
    const emailInput = document.getElementById('modalLoginEmail');
    const passInput = document.getElementById('modalLoginPassword');
    const errorAlert = document.getElementById('modalLoginErrorAlert');
    const errorText = document.getElementById('modalLoginErrorText');
    const submitBtn = document.getElementById('modalLoginSubmitBtn');

    // Auto-clear error when user types
    [emailInput, passInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          if (errorAlert) {
            errorAlert.classList.add('d-none');
            errorAlert.classList.remove('d-flex');
          }
          if (passInput) passInput.classList.remove('is-invalid');
          if (emailInput) emailInput.classList.remove('is-invalid');
        });
      }
    });

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value.trim() : '';

        if (errorAlert) {
          errorAlert.classList.add('d-none');
          errorAlert.classList.remove('d-flex');
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Authenticating...';
        }

        try {
          await AuthService.login(email, password);
          const bsModal = bootstrap.Modal.getInstance(authModal);
          if (bsModal) bsModal.hide();
          Toast.show(`Welcome back! Logged in as ${email}`, 'success');
          
          if (AuthService.hasRole('ROLE_ADMIN') && window.location.pathname.includes('admin/')) {
            window.location.reload();
          }
        } catch (err) {
          const errMsg = (err && err.message) ? err.message : 'Your email or password is incorrect. Please check your credentials.';
          if (errorAlert && errorText) {
            errorText.textContent = errMsg;
            errorAlert.classList.remove('d-none');
            errorAlert.classList.add('d-flex');
          }
          if (passInput) passInput.classList.add('is-invalid');
          if (emailInput) emailInput.classList.add('is-invalid');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Sign In to Account';
          }
        }
      });
    }
  }
};
