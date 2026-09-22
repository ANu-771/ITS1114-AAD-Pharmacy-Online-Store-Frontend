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
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value.trim() : '';

        if (!email || !password) {
          Toast.show('Please enter both email and password.', 'warning');
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
          Toast.show(err.message || 'Login failed. Please check credentials.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Sign In to Account';
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
