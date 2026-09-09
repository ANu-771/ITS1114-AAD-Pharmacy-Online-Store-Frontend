/**
 * KK PHARMACY ONLINE PHARMACY - REGISTRATION CONTROLLER (js/pages/register.js)
 * Manages customer account registration, password matching validation, and automated authentication.
 */
const RegisterPage = {
  init: () => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const pass = document.getElementById('regPassword').value;
      const confirmPass = document.getElementById('regConfirmPassword').value;

      if (pass !== confirmPass) {
        Toast.show('Passwords do not match! Please check and try again.', 'warning');
        return;
      }

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        Toast.show('Please fill in all mandatory fields.', 'warning');
        return;
      }

      const userData = {
        fullName: document.getElementById('regFullName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        address: document.getElementById('regAddress').value.trim(),
        city: document.getElementById('regCity').value,
        password: pass
      };

      try {
        await AuthService.register(userData);
        Toast.show('Account created successfully! Logging you in...', 'success');
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 1000);
      } catch (err) {
        Toast.show(err.message || 'Registration failed. Please try again.', 'error');
      }
    });
  }
};
