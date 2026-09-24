/**
 * KK PHARMACY ONLINE PHARMACY - REGISTRATION CONTROLLER (js/pages/register.js)
 * Manages customer account registration, strict regex validation, and immediate session startup.
 */
const RegisterPage = {
  // Regex patterns
  PATTERNS: {
    FULL_NAME: /^[a-zA-Z\s.]{3,60}$/,
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^(?:\+94\s?|0)?7[0-9]{1}[\s-]?[0-9]{3}[\s-]?[0-9]{4}$/,
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d).{6,30}$/, // At least 1 letter and 1 number, min 6 chars
    MIN_ADDRESS_LENGTH: 5
  },

  init: () => {
    // If already authenticated, redirect to profile
    if (AuthService.isAuthenticated()) {
      window.location.href = 'profile.html';
      return;
    }

    RegisterPage.attachValidationListeners();
    RegisterPage.attachSubmitListener();
  },

  // Set field validation state with custom feedback message
  setFieldState: (inputEl, isValid, feedbackMessage) => {
    if (!inputEl) return;
    const feedbackEl = inputEl.parentElement ? inputEl.parentElement.querySelector('.invalid-feedback') : null;

    if (isValid) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
    } else {
      inputEl.classList.remove('is-valid');
      inputEl.classList.add('is-invalid');
      if (feedbackEl && feedbackMessage) {
        feedbackEl.textContent = feedbackMessage;
      }
    }
  },

  // Clear validation state
  clearFieldState: (inputEl) => {
    if (!inputEl) return;
    inputEl.classList.remove('is-invalid', 'is-valid');
  },

  // Live validation listeners on typing & blur
  attachValidationListeners: () => {
    const fields = [
      { id: 'regFullName', validator: RegisterPage.validateFullName },
      { id: 'regEmail', validator: RegisterPage.validateEmail },
      { id: 'regPhone', validator: RegisterPage.validatePhone },
      { id: 'regAddress', validator: RegisterPage.validateAddress },
      { id: 'regPassword', validator: RegisterPage.validatePassword },
      { id: 'regConfirmPassword', validator: RegisterPage.validateConfirmPassword },
      { id: 'regCity', validator: RegisterPage.validateCity },
      { id: 'regTerms', validator: RegisterPage.validateTerms }
    ];

    fields.forEach(({ id, validator }) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          RegisterPage.hideGlobalError();
          validator(false); // validate on input without forcing error if empty
        });
        el.addEventListener('blur', () => {
          validator(true); // validate strictly on blur
        });
      }
    });
  },

  validateFullName: (strict = true) => {
    const el = document.getElementById('regFullName');
    if (!el) return true;
    const val = el.value.trim();

    if (!val) {
      if (strict) RegisterPage.setFieldState(el, false, 'Full Name is required and cannot be blank.');
      else RegisterPage.clearFieldState(el);
      return false;
    }
    if (!RegisterPage.PATTERNS.FULL_NAME.test(val)) {
      RegisterPage.setFieldState(el, false, 'Full Name must be 3-60 characters and contain letters only.');
      return false;
    }
    RegisterPage.setFieldState(el, true);
    return true;
  },

  validateEmail: (strict = true) => {
    const el = document.getElementById('regEmail');
    if (!el) return true;
    const val = el.value.trim();

    if (!val) {
      if (strict) RegisterPage.setFieldState(el, false, 'Email Address is required.');
      else RegisterPage.clearFieldState(el);
      return false;
    }
    if (!RegisterPage.PATTERNS.EMAIL.test(val)) {
      RegisterPage.setFieldState(el, false, 'Please enter a valid email format (e.g. name@example.com).');
      return false;
    }
    RegisterPage.setFieldState(el, true);
    return true;
  },

  validatePhone: (strict = true) => {
    const el = document.getElementById('regPhone');
    if (!el) return true;
    const val = el.value.trim();

    if (!val) {
      if (strict) RegisterPage.setFieldState(el, false, 'Contact Phone Number is required.');
      else RegisterPage.clearFieldState(el);
      return false;
    }
    if (!RegisterPage.PATTERNS.PHONE.test(val)) {
      RegisterPage.setFieldState(el, false, 'Enter a valid Sri Lankan mobile number (e.g. +94 77 123 4567 or 077 123 4567).');
      return false;
    }
    RegisterPage.setFieldState(el, true);
    return true;
  },

  validateCity: (strict = true) => {
    const el = document.getElementById('regCity');
    if (!el) return true;
    const val = el.value.trim();

    if (!val) {
      if (strict) RegisterPage.setFieldState(el, false, 'Please select your city or district.');
      else RegisterPage.clearFieldState(el);
      return false;
    }
    RegisterPage.setFieldState(el, true);
    return true;
  },

  validateAddress: (strict = true) => {
    const el = document.getElementById('regAddress');
    if (!el) return true;
    const val = el.value.trim();

    if (!val) {
      if (strict) RegisterPage.setFieldState(el, false, 'Delivery Street Address is required.');
      else RegisterPage.clearFieldState(el);
      return false;
    }
    if (val.length < RegisterPage.PATTERNS.MIN_ADDRESS_LENGTH) {
      RegisterPage.setFieldState(el, false, 'Address must be at least 5 characters long.');
      return false;
    }
    RegisterPage.setFieldState(el, true);
    return true;
  },

  validatePassword: (strict = true) => {
    const el = document.getElementById('regPassword');
    if (!el) return true;
    const val = el.value;

    if (!val) {
      if (strict) RegisterPage.setFieldState(el, false, 'Password is required.');
      else RegisterPage.clearFieldState(el);
      return false;
    }
    if (!RegisterPage.PATTERNS.PASSWORD.test(val)) {
      RegisterPage.setFieldState(el, false, 'Password must be at least 6 characters and include letters & numbers.');
      return false;
    }
    RegisterPage.setFieldState(el, true);

    // Also re-validate confirm password if it has value
    const confirmEl = document.getElementById('regConfirmPassword');
    if (confirmEl && confirmEl.value) {
      RegisterPage.validateConfirmPassword(true);
    }
    return true;
  },

  validateConfirmPassword: (strict = true) => {
    const passEl = document.getElementById('regPassword');
    const confirmEl = document.getElementById('regConfirmPassword');
    if (!confirmEl || !passEl) return true;
    const passVal = passEl.value;
    const confirmVal = confirmEl.value;

    if (!confirmVal) {
      if (strict) RegisterPage.setFieldState(confirmEl, false, 'Please re-enter your password to confirm.');
      else RegisterPage.clearFieldState(confirmEl);
      return false;
    }
    if (passVal !== confirmVal) {
      RegisterPage.setFieldState(confirmEl, false, 'Passwords do not match. Please verify.');
      return false;
    }
    RegisterPage.setFieldState(confirmEl, true);
    return true;
  },

  validateTerms: (strict = true) => {
    const el = document.getElementById('regTerms');
    if (!el) return true;

    if (!el.checked) {
      if (strict) RegisterPage.setFieldState(el, false, 'You must agree to KK PHARMACY terms to register.');
      return false;
    }
    RegisterPage.setFieldState(el, true);
    return true;
  },

  showGlobalError: (message) => {
    const alertEl = document.getElementById('regErrorAlert');
    const textEl = document.getElementById('regErrorText');
    if (alertEl && textEl) {
      textEl.textContent = message || 'Please correct the highlighted fields before submitting.';
      alertEl.classList.remove('d-none');
      alertEl.classList.add('d-flex');
    }
  },

  hideGlobalError: () => {
    const alertEl = document.getElementById('regErrorAlert');
    if (alertEl) {
      alertEl.classList.add('d-none');
      alertEl.classList.remove('d-flex');
    }
  },

  attachSubmitListener: () => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      RegisterPage.hideGlobalError();

      // Validate all fields strictly
      const isNameValid = RegisterPage.validateFullName(true);
      const isEmailValid = RegisterPage.validateEmail(true);
      const isPhoneValid = RegisterPage.validatePhone(true);
      const isCityValid = RegisterPage.validateCity(true);
      const isAddressValid = RegisterPage.validateAddress(true);
      const isPassValid = RegisterPage.validatePassword(true);
      const isConfirmValid = RegisterPage.validateConfirmPassword(true);
      const isTermsValid = RegisterPage.validateTerms(true);

      const allValid = isNameValid && isEmailValid && isPhoneValid && isCityValid &&
                       isAddressValid && isPassValid && isConfirmValid && isTermsValid;

      if (!allValid) {
        RegisterPage.showGlobalError('Please fill in all mandatory fields with valid information.');
        // Focus first invalid element
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const city = document.getElementById('regCity')?.value || 'Colombo';
      const address = document.getElementById('regAddress')?.value.trim() || '';

      const userData = {
        fullName: document.getElementById('regFullName')?.value.trim() || '',
        email: document.getElementById('regEmail')?.value.trim() || '',
        phone: document.getElementById('regPhone')?.value.trim() || '',
        password: document.getElementById('regPassword')?.value || ''
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Creating Patient Account...';
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
        const errMsg = err.message || 'Registration failed. Please check your details.';
        RegisterPage.showGlobalError(errMsg);
        Toast.show(errMsg, 'error');
      } finally {
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

