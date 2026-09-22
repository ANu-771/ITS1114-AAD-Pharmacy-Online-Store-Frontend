/**
 * KK PHARMACY ONLINE PHARMACY - REGISTRATION CONTROLLER (js/pages/register.js)
 * Manages customer account registration, validation, and immediate session startup.
 */
const RegisterPage = {
  init: () => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const pass = document.getElementById('regPassword')?.value || '';
      const confirmPass = document.getElementById('regConfirmPassword')?.value || '';

      if (pass !== confirmPass) {
        Toast.show('Passwords do not match! Please check and try again.', 'warning');
        return;
      }

      if (pass.length < 6) {
        Toast.show('Password must be at least 6 characters.', 'warning');
        return;
      }

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        Toast.show('Please fill in all mandatory fields correctly.', 'warning');
        return;
      }

      const city = document.getElementById('regCity')?.value || 'Colombo';
      const address = document.getElementById('regAddress')?.value.trim() || '';

      const userData = {
        fullName: document.getElementById('regFullName')?.value.trim() || '',
        email: document.getElementById('regEmail')?.value.trim() || '',
        phone: document.getElementById('regPhone')?.value.trim() || '',
        password: pass
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Creating Account in Database...';
      }

      try {
        await AuthService.register(userData);

        // Store user address in local session for instant pre-fill in profile & checkout
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          currentUser.city = city;
          currentUser.address = address;
          StorageService.setItem(CONFIG.STORAGE_KEYS.USER, currentUser);
          StorageService.setItem(CONFIG.STORAGE_KEYS.USER_INFO, currentUser);
        }

        Toast.show('Account created successfully! Welcome to KK PHARMACY.', 'success');
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 800);
      } catch (err) {
        console.error('[RegisterPage] Registration error:', err);
        Toast.show(err.message || 'Registration failed. Please check your details.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="bi bi-shield-check me-1"></i> Register & Create Account';
        }
      }
    });
  }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => RegisterPage.init());
} else {
  RegisterPage.init();
}
