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

      const userData = {
        fullName: document.getElementById('regFullName')?.value.trim() || '',
        email: document.getElementById('regEmail')?.value.trim() || '',
        phone: document.getElementById('regPhone')?.value.trim() || '',
        password: pass
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Creating Account...';
      }

      try {
        await AuthService.register(userData);
        Toast.show('Account created successfully! Logging you in...', 'success');
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 1000);
      } catch (err) {
        Toast.show(err.message || 'Registration failed. Please check your details.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Create Account';
        }
      }
    });
  }
};
