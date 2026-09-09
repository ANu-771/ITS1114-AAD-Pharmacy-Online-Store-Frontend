/**
 * KK PHARMACY ONLINE PHARMACY - LOGIN PAGE CONTROLLER (js/pages/login.js)
 * Manages form authentication, JWT storage, role-based redirects, and demo switcher buttons.
 */
const LoginPage = {
  init: () => {
    // If already authenticated, redirect to profile or home
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

    // Demo Fill Buttons
    document.getElementById('btnFillUser')?.addEventListener('click', () => {
      emailInput.value = 'user@example.com';
      passInput.value = 'password123';
      Toast.show('Filled Customer Demo Credentials', 'info');
    });

    document.getElementById('btnFillAdmin')?.addEventListener('click', () => {
      emailInput.value = 'admin@medora.com';
      passInput.value = 'admin123';
      Toast.show('Filled Admin Demo Credentials', 'info');
    });

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passInput.value.trim();

        if (!email || !password) {
          Toast.show('Please enter both email and password.', 'warning');
          return;
        }

        try {
          const user = await AuthService.login(email, password);
          Toast.show(`Authentication Successful! Logged in as ${user.fullName}`, 'success');

          setTimeout(() => {
            if (AuthService.hasRole('ROLE_ADMIN')) {
              window.location.href = '../admin/dashboard.html';
            } else {
              window.location.href = 'profile.html';
            }
          }, 800);
        } catch (err) {
          Toast.show(err.message || 'Login failed. Please check credentials.', 'error');
        }
      });
    }
  }
};
