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
  /**
   * Universal Auth Modal for Guest Users & Forgot Password OTP System
   */
  initAuthModal: () => {
    let authModal = document.getElementById('authModal');
    if (!authModal) {
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = `
        <div class="modal fade" id="authModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 18px; overflow: hidden;">
              
              <!-- 1. SIGN IN VIEW -->
              <div id="modalSignInView">
                <div class="modal-header border-0 pb-0 pt-4 px-4">
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
                      <label class="form-label small fw-semibold text-secondary">Email or Username</label>
                      <div class="input-group">
                        <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-envelope"></i></span>
                        <input type="email" id="modalLoginEmail" class="form-control border-start-0 ps-0" placeholder="name@example.com" required autocomplete="username">
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-semibold text-secondary">Password</label>
                      <div class="input-group">
                        <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-key"></i></span>
                        <input type="password" id="modalLoginPassword" class="form-control border-start-0 ps-0" placeholder="Enter your password" required autocomplete="current-password">
                      </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="modalRememberMe" checked>
                        <label class="form-check-label small text-muted" for="modalRememberMe">Remember me</label>
                      </div>
                      <button type="button" class="btn btn-link p-0 small text-primary text-decoration-none fw-medium" id="modalOpenForgotPassBtn">Forgot Password?</button>
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

              <!-- 2. FORGOT PASSWORD OTP VIEW -->
              <div id="modalForgotPassView" class="d-none">
                <div class="modal-header border-0 pb-0 pt-4 px-4">
                  <div>
                    <h5 class="modal-title fw-bold text-navy mb-0"><i class="bi bi-shield-check me-2 text-success"></i>Password Recovery</h5>
                    <p class="text-muted small mb-0">Recover your account via 6-digit verification code</p>
                  </div>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">

                  <!-- Step 1: Request OTP -->
                  <div id="modalForgotStep1">
                    <div class="alert alert-danger py-2 px-3 small rounded-3 d-none align-items-center gap-2 mb-3" id="modalForgotErrorAlert1" role="alert">
                      <i class="bi bi-exclamation-circle text-danger fs-5 flex-shrink-0"></i>
                      <div class="flex-grow-1" id="modalForgotErrorText1">Please check your email address.</div>
                    </div>

                    <p class="text-muted small mb-3">
                      Enter the email address associated with your pharmacy account. We will send a secure 6-digit one-time verification code.
                    </p>

                    <form id="modalForgotEmailForm">
                      <div class="mb-3">
                        <label class="form-label small fw-semibold text-secondary">Account Email Address</label>
                        <div class="input-group">
                          <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-envelope"></i></span>
                          <input type="email" id="modalForgotEmail" class="form-control border-start-0 ps-0" placeholder="name@example.com" required autocomplete="email">
                        </div>
                      </div>
                      <button type="submit" class="btn btn-primary-pharmacy w-100 py-2 mb-3" id="modalForgotSendOtpBtn">
                        <i class="bi bi-send me-1"></i> Send Verification Code
                      </button>
                      <div class="text-center">
                        <button type="button" class="btn btn-link btn-sm text-secondary text-decoration-none" id="modalBackToLoginBtn1">
                          <i class="bi bi-arrow-left me-1"></i> Back to Sign In
                        </button>
                      </div>
                    </form>
                  </div>

                  <!-- Step 2: Verify 6-Digit OTP Code -->
                  <div id="modalForgotStep2" class="d-none">
                    <div class="alert alert-danger py-2 px-3 small rounded-3 d-none align-items-center gap-2 mb-3" id="modalForgotErrorAlert2" role="alert">
                      <i class="bi bi-exclamation-circle text-danger fs-5 flex-shrink-0"></i>
                      <div class="flex-grow-1" id="modalForgotErrorText2">Invalid or expired code.</div>
                    </div>

                    <div class="text-center mb-3">
                      <div class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill small mb-2">
                        <i class="bi bi-envelope-check me-1"></i> Code Sent
                      </div>
                      <p class="text-muted small mb-0">
                        Enter the 6-digit verification code sent to <strong id="modalForgotTargetEmail" class="text-dark"></strong>
                      </p>
                    </div>

                    <form id="modalForgotOtpForm">
                      <div class="mb-3 text-center">
                        <input type="text" id="modalForgotOtpInput" class="form-control text-center fs-4 fw-bold letter-spacing-3 py-2" placeholder="••••••" maxlength="6" pattern="[0-9]{6}" required autocomplete="one-time-code" style="letter-spacing: 8px;">
                        <div class="form-text small text-muted mt-2">Code valid for 10 minutes</div>
                      </div>

                      <button type="submit" class="btn btn-primary-pharmacy w-100 py-2 mb-3" id="modalForgotVerifyBtn">
                        <i class="bi bi-check2-circle me-1"></i> Verify Code
                      </button>

                      <div class="d-flex justify-content-between align-items-center small">
                        <button type="button" class="btn btn-link btn-sm p-0 text-secondary text-decoration-none" id="modalForgotChangeEmailBtn">
                          <i class="bi bi-pencil-square me-1"></i> Change Email
                        </button>
                        <button type="button" class="btn btn-link btn-sm p-0 text-primary text-decoration-none" id="modalForgotResendBtn" disabled>
                          Resend Code (<span id="modalForgotCountdown">59</span>s)
                        </button>
                      </div>
                    </form>
                  </div>

                  <!-- Step 3: Set New Password -->
                  <div id="modalForgotStep3" class="d-none">
                    <div class="alert alert-danger py-2 px-3 small rounded-3 d-none align-items-center gap-2 mb-3" id="modalForgotErrorAlert3" role="alert">
                      <i class="bi bi-exclamation-circle text-danger fs-5 flex-shrink-0"></i>
                      <div class="flex-grow-1" id="modalForgotErrorText3">Password error.</div>
                    </div>

                    <p class="text-muted small mb-3">
                      Create a strong new password for your pharmacy account (at least 6 characters).
                    </p>

                    <form id="modalForgotNewPassForm">
                      <div class="mb-3">
                        <label class="form-label small fw-semibold text-secondary">New Password</label>
                        <div class="input-group">
                          <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-shield-lock"></i></span>
                          <input type="password" id="modalForgotNewPass" class="form-control border-start-0 ps-0" placeholder="Minimum 6 characters" required autocomplete="new-password">
                        </div>
                      </div>

                      <div class="mb-3">
                        <label class="form-label small fw-semibold text-secondary">Confirm New Password</label>
                        <div class="input-group">
                          <span class="input-group-text bg-light text-muted border-end-0"><i class="bi bi-lock-fill"></i></span>
                          <input type="password" id="modalForgotConfirmPass" class="form-control border-start-0 ps-0" placeholder="Re-enter password" required autocomplete="new-password">
                        </div>
                      </div>

                      <button type="submit" class="btn btn-success w-100 py-2 mb-2 fw-semibold" id="modalForgotResetSubmitBtn">
                        <i class="bi bi-arrow-repeat me-1"></i> Update & Save Password
                      </button>
                    </form>
                  </div>

                  <!-- Step 4: Success View -->
                  <div id="modalForgotStep4" class="d-none text-center py-3">
                    <div class="mb-3 text-success fs-1">
                      <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <h5 class="fw-bold text-navy mb-2">Password Updated!</h5>
                    <p class="text-muted small mb-4">
                      Your KK PHARMACY account password has been reset successfully. You can now sign in with your new password.
                    </p>
                    <button type="button" class="btn btn-primary-pharmacy w-100 py-2" id="modalForgotReturnToLoginBtn">
                      <i class="bi bi-box-arrow-in-right me-1"></i> Sign In to Account
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalContainer);
      authModal = document.getElementById('authModal');
    }

    // View Elements
    const signInView = document.getElementById('modalSignInView');
    const forgotView = document.getElementById('modalForgotPassView');
    const openForgotBtn = document.getElementById('modalOpenForgotPassBtn');

    // Forgot Steps
    const forgotStep1 = document.getElementById('modalForgotStep1');
    const forgotStep2 = document.getElementById('modalForgotStep2');
    const forgotStep3 = document.getElementById('modalForgotStep3');
    const forgotStep4 = document.getElementById('modalForgotStep4');

    // State
    let recoveryState = {
      email: '',
      otp: '',
      resendTimer: null
    };

    const showForgotStep = (stepNumber) => {
      [forgotStep1, forgotStep2, forgotStep3, forgotStep4].forEach((s, idx) => {
        if (s) {
          if (idx + 1 === stepNumber) {
            s.classList.remove('d-none');
          } else {
            s.classList.add('d-none');
          }
        }
      });
    };

    const switchToSignIn = () => {
      if (signInView) signInView.classList.remove('d-none');
      if (forgotView) forgotView.classList.add('d-none');
    };

    const switchToForgot = () => {
      if (signInView) signInView.classList.add('d-none');
      if (forgotView) forgotView.classList.remove('d-none');
      showForgotStep(1);
      const loginEmail = document.getElementById('modalLoginEmail');
      const forgotEmail = document.getElementById('modalForgotEmail');
      if (loginEmail && forgotEmail && loginEmail.value.trim()) {
        forgotEmail.value = loginEmail.value.trim();
      }
    };

    if (openForgotBtn) {
      openForgotBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchToForgot();
      });
    }

    document.getElementById('modalBackToLoginBtn1')?.addEventListener('click', switchToSignIn);
    document.getElementById('modalForgotChangeEmailBtn')?.addEventListener('click', () => showForgotStep(1));

    document.getElementById('modalForgotReturnToLoginBtn')?.addEventListener('click', () => {
      switchToSignIn();
      const loginEmail = document.getElementById('modalLoginEmail');
      const loginPass = document.getElementById('modalLoginPassword');
      if (loginEmail) loginEmail.value = recoveryState.email;
      if (loginPass) {
        loginPass.value = '';
        loginPass.focus();
      }
    });

    // ----------------------------------------------------
    // Sign-in Form Submission & Inline Alert
    // ----------------------------------------------------
    const loginForm = document.getElementById('modalLoginForm');
    const loginEmailInput = document.getElementById('modalLoginEmail');
    const loginPassInput = document.getElementById('modalLoginPassword');
    const loginErrorAlert = document.getElementById('modalLoginErrorAlert');
    const loginErrorText = document.getElementById('modalLoginErrorText');
    const loginSubmitBtn = document.getElementById('modalLoginSubmitBtn');

    [loginEmailInput, loginPassInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          if (loginErrorAlert) {
            loginErrorAlert.classList.add('d-none');
            loginErrorAlert.classList.remove('d-flex');
          }
          if (loginPassInput) loginPassInput.classList.remove('is-invalid');
          if (loginEmailInput) loginEmailInput.classList.remove('is-invalid');
        });
      }
    });

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginEmailInput ? loginEmailInput.value.trim() : '';
        const password = loginPassInput ? loginPassInput.value.trim() : '';

        if (loginErrorAlert) {
          loginErrorAlert.classList.add('d-none');
          loginErrorAlert.classList.remove('d-flex');
        }

        if (loginSubmitBtn) {
          loginSubmitBtn.disabled = true;
          loginSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Authenticating...';
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
          if (loginErrorAlert && loginErrorText) {
            loginErrorText.textContent = errMsg;
            loginErrorAlert.classList.remove('d-none');
            loginErrorAlert.classList.add('d-flex');
          }
          if (loginPassInput) loginPassInput.classList.add('is-invalid');
          if (loginEmailInput) loginEmailInput.classList.add('is-invalid');
        } finally {
          if (loginSubmitBtn) {
            loginSubmitBtn.disabled = false;
            loginSubmitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Sign In to Account';
          }
        }
      });
    }

    // ----------------------------------------------------
    // Forgot Password Step 1: Send OTP
    // ----------------------------------------------------
    const forgotEmailForm = document.getElementById('modalForgotEmailForm');
    const forgotEmailInput = document.getElementById('modalForgotEmail');
    const forgotErrorAlert1 = document.getElementById('modalForgotErrorAlert1');
    const forgotErrorText1 = document.getElementById('modalForgotErrorText1');
    const forgotSendOtpBtn = document.getElementById('modalForgotSendOtpBtn');

    if (forgotEmailInput) {
      forgotEmailInput.addEventListener('input', () => {
        if (forgotErrorAlert1) {
          forgotErrorAlert1.classList.add('d-none');
          forgotErrorAlert1.classList.remove('d-flex');
        }
        forgotEmailInput.classList.remove('is-invalid');
      });
    }

    const startResendCountdown = () => {
      let seconds = 59;
      const resendBtn = document.getElementById('modalForgotResendBtn');
      const countdownSpan = document.getElementById('modalForgotCountdown');
      if (!resendBtn || !countdownSpan) return;

      if (recoveryState.resendTimer) clearInterval(recoveryState.resendTimer);
      resendBtn.disabled = true;
      countdownSpan.textContent = seconds;

      recoveryState.resendTimer = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
          clearInterval(recoveryState.resendTimer);
          resendBtn.disabled = false;
          resendBtn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Resend Code';
        } else {
          countdownSpan.textContent = seconds;
        }
      }, 1000);
    };

    if (forgotEmailForm) {
      forgotEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = forgotEmailInput ? forgotEmailInput.value.trim() : '';
        if (!email) return;

        if (forgotSendOtpBtn) {
          forgotSendOtpBtn.disabled = true;
          forgotSendOtpBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Sending 6-Digit Code...';
        }

        try {
          await AuthService.forgotPassword(email);
          recoveryState.email = email;
          const targetEl = document.getElementById('modalForgotTargetEmail');
          if (targetEl) targetEl.textContent = email;

          showForgotStep(2);
          startResendCountdown();
          const otpInput = document.getElementById('modalForgotOtpInput');
          if (otpInput) {
            otpInput.value = '';
            otpInput.focus();
          }
        } catch (err) {
          if (forgotErrorAlert1 && forgotErrorText1) {
            forgotErrorText1.textContent = err.message || 'Unable to process request. Please check email.';
            forgotErrorAlert1.classList.remove('d-none');
            forgotErrorAlert1.classList.add('d-flex');
          }
          if (forgotEmailInput) forgotEmailInput.classList.add('is-invalid');
        } finally {
          if (forgotSendOtpBtn) {
            forgotSendOtpBtn.disabled = false;
            forgotSendOtpBtn.innerHTML = '<i class="bi bi-send me-1"></i> Send Verification Code';
          }
        }
      });
    }

    // Resend Button in Step 2
    document.getElementById('modalForgotResendBtn')?.addEventListener('click', async () => {
      if (!recoveryState.email) return;
      try {
        await AuthService.forgotPassword(recoveryState.email);
        Toast.show(`New verification code sent to ${recoveryState.email}`, 'info');
        startResendCountdown();
      } catch (err) {
        Toast.show(err.message || 'Error resending code', 'error');
      }
    });

    // ----------------------------------------------------
    // Forgot Password Step 2: Verify OTP
    // ----------------------------------------------------
    const forgotOtpForm = document.getElementById('modalForgotOtpForm');
    const forgotOtpInput = document.getElementById('modalForgotOtpInput');
    const forgotErrorAlert2 = document.getElementById('modalForgotErrorAlert2');
    const forgotErrorText2 = document.getElementById('modalForgotErrorText2');
    const forgotVerifyBtn = document.getElementById('modalForgotVerifyBtn');

    if (forgotOtpInput) {
      forgotOtpInput.addEventListener('input', () => {
        if (forgotErrorAlert2) {
          forgotErrorAlert2.classList.add('d-none');
          forgotErrorAlert2.classList.remove('d-flex');
        }
        forgotOtpInput.classList.remove('is-invalid');
      });
    }

    if (forgotOtpForm) {
      forgotOtpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = forgotOtpInput ? forgotOtpInput.value.trim() : '';
        if (code.length !== 6) {
          if (forgotErrorAlert2 && forgotErrorText2) {
            forgotErrorText2.textContent = 'Please enter the full 6-digit verification code.';
            forgotErrorAlert2.classList.remove('d-none');
            forgotErrorAlert2.classList.add('d-flex');
          }
          return;
        }

        if (forgotVerifyBtn) {
          forgotVerifyBtn.disabled = true;
          forgotVerifyBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Verifying...';
        }

        try {
          await AuthService.verifyOtp(recoveryState.email, code);
          recoveryState.otp = code;
          showForgotStep(3);
          const newPassInput = document.getElementById('modalForgotNewPass');
          if (newPassInput) {
            newPassInput.value = '';
            newPassInput.focus();
          }
        } catch (err) {
          if (forgotErrorAlert2 && forgotErrorText2) {
            forgotErrorText2.textContent = err.message || 'Invalid or expired code. Please try again.';
            forgotErrorAlert2.classList.remove('d-none');
            forgotErrorAlert2.classList.add('d-flex');
          }
          if (forgotOtpInput) forgotOtpInput.classList.add('is-invalid');
        } finally {
          if (forgotVerifyBtn) {
            forgotVerifyBtn.disabled = false;
            forgotVerifyBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Verify Code';
          }
        }
      });
    }

    // ----------------------------------------------------
    // Forgot Password Step 3: Set New Password
    // ----------------------------------------------------
    const newPassForm = document.getElementById('modalForgotNewPassForm');
    const newPassInput = document.getElementById('modalForgotNewPass');
    const confirmPassInput = document.getElementById('modalForgotConfirmPass');
    const forgotErrorAlert3 = document.getElementById('modalForgotErrorAlert3');
    const forgotErrorText3 = document.getElementById('modalForgotErrorText3');
    const resetSubmitBtn = document.getElementById('modalForgotResetSubmitBtn');

    [newPassInput, confirmPassInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          if (forgotErrorAlert3) {
            forgotErrorAlert3.classList.add('d-none');
            forgotErrorAlert3.classList.remove('d-flex');
          }
          if (newPassInput) newPassInput.classList.remove('is-invalid');
          if (confirmPassInput) confirmPassInput.classList.remove('is-invalid');
        });
      }
    });

    if (newPassForm) {
      newPassForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass1 = newPassInput ? newPassInput.value.trim() : '';
        const pass2 = confirmPassInput ? confirmPassInput.value.trim() : '';

        if (pass1.length < 6) {
          if (forgotErrorAlert3 && forgotErrorText3) {
            forgotErrorText3.textContent = 'Password must be at least 6 characters long.';
            forgotErrorAlert3.classList.remove('d-none');
            forgotErrorAlert3.classList.add('d-flex');
          }
          if (newPassInput) newPassInput.classList.add('is-invalid');
          return;
        }

        if (pass1 !== pass2) {
          if (forgotErrorAlert3 && forgotErrorText3) {
            forgotErrorText3.textContent = 'Passwords do not match. Please re-enter.';
            forgotErrorAlert3.classList.remove('d-none');
            forgotErrorAlert3.classList.add('d-flex');
          }
          if (confirmPassInput) confirmPassInput.classList.add('is-invalid');
          return;
        }

        if (resetSubmitBtn) {
          resetSubmitBtn.disabled = true;
          resetSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Updating Password...';
        }

        try {
          await AuthService.resetPassword(recoveryState.email, recoveryState.otp, pass1);
          showForgotStep(4);
        } catch (err) {
          if (forgotErrorAlert3 && forgotErrorText3) {
            forgotErrorText3.textContent = err.message || 'Failed to update password. Please try again.';
            forgotErrorAlert3.classList.remove('d-none');
            forgotErrorAlert3.classList.add('d-flex');
          }
        } finally {
          if (resetSubmitBtn) {
            resetSubmitBtn.disabled = false;
            resetSubmitBtn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Update & Save Password';
          }
        }
      });
    }
  }
};
