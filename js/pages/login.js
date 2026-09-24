/**
 * KK PHARMACY ONLINE PHARMACY - LOGIN PAGE CONTROLLER (js/pages/login.js)
 * Manages form authentication, JWT storage, role-based redirects, and demo credentials.
 */
const LoginPage = {
  init: () => {
    // If already authenticated, redirect to profile or admin dashboard
    if (AuthService.isAuthenticated()) {
      if (AuthService.hasRole('ROLE_ADMIN')) {
        window.location.href = '../admin/dashboard.html';
      } else {
        window.location.href = 'profile.html';
      }
      return;
    }

    LoginPage.attachListeners();
  },

  attachListeners: () => {
    const form = document.getElementById('standaloneLoginForm');
    const emailInput = document.getElementById('loginEmailInput');
    const passInput = document.getElementById('loginPasswordInput');
    const errorAlert = document.getElementById('loginErrorAlert');
    const errorText = document.getElementById('loginErrorText');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    // Auto-clear error alerts and invalid styles on typing
    [emailInput, passInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          if (errorAlert) {
            errorAlert.classList.add('d-none');
            errorAlert.classList.remove('d-flex');
          }
          if (emailInput) emailInput.classList.remove('is-invalid');
          if (passInput) passInput.classList.remove('is-invalid');
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

        if (!email || !password) {
          if (errorAlert && errorText) {
            errorText.textContent = 'Please enter both email and password.';
            errorAlert.classList.remove('d-none');
            errorAlert.classList.add('d-flex');
          }
          if (!email && emailInput) emailInput.classList.add('is-invalid');
          if (!password && passInput) passInput.classList.add('is-invalid');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Authenticating...';
        }

        try {
          const authRes = await AuthService.login(email, password);
          const userName = (authRes.user && authRes.user.fullName) || authRes.fullName || email.split('@')[0];
          Toast.show(`Authentication Successful! Welcome, ${userName}.`, 'success');

          setTimeout(() => {
            if (AuthService.hasRole('ROLE_ADMIN')) {
              window.location.href = '../admin/dashboard.html';
            } else {
              window.location.href = 'profile.html';
            }
          }, 800);
        } catch (err) {
          const errMsg = (err && err.message) ? err.message : 'Your email or password is incorrect. Please check your credentials.';
          if (errorAlert && errorText) {
            errorText.textContent = errMsg;
            errorAlert.classList.remove('d-none');
            errorAlert.classList.add('d-flex');
          } else {
            Toast.show(errMsg, 'error');
          }
          if (emailInput) emailInput.classList.add('is-invalid');
          if (passInput) passInput.classList.add('is-invalid');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i> Sign In to Account';
          }
        }
      });
    }
  }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => LoginPage.init());
} else {
  LoginPage.init();
}
