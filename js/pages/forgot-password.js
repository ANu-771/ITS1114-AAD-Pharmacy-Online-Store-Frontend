/**
 * KK PHARMACY ONLINE PHARMACY - FORGOT PASSWORD CONTROLLER (js/pages/forgot-password.js)
 * Manages 6-digit OTP verification code recovery flow.
 */
const ForgotPasswordPage = {
  state: {
    email: '',
    otp: '',
    resendTimer: null
  },

  init: () => {
    // If already logged in, redirect away
    if (AuthService.isAuthenticated()) {
      window.location.href = 'profile.html';
      return;
    }

    ForgotPasswordPage.attachListeners();
  },

  showStep: (stepNumber) => {
    const s1 = document.getElementById('pageForgotStep1');
    const s2 = document.getElementById('pageForgotStep2');
    const s3 = document.getElementById('pageForgotStep3');
    const s4 = document.getElementById('pageForgotStep4');

    [s1, s2, s3, s4].forEach((s, idx) => {
      if (s) {
        if (idx + 1 === stepNumber) {
          s.classList.remove('d-none');
        } else {
          s.classList.add('d-none');
        }
      }
    });
  },

  startResendCountdown: () => {
    let seconds = 59;
    const resendBtn = document.getElementById('pageForgotResendBtn');
    const countdownSpan = document.getElementById('pageForgotCountdown');
    if (!resendBtn || !countdownSpan) return;

    if (ForgotPasswordPage.state.resendTimer) clearInterval(ForgotPasswordPage.state.resendTimer);
    resendBtn.disabled = true;
    countdownSpan.textContent = seconds;

    ForgotPasswordPage.state.resendTimer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(ForgotPasswordPage.state.resendTimer);
        resendBtn.disabled = false;
        resendBtn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Resend Code';
      } else {
        countdownSpan.textContent = seconds;
      }
    }, 1000);
  },

  attachListeners: () => {
    // ------------------------------------
    // STEP 1: Send OTP
    // ------------------------------------
    const form1 = document.getElementById('pageForgotEmailForm');
    const emailInput = document.getElementById('pageForgotEmailInput');
    const alert1 = document.getElementById('pageForgotAlert1');
    const alertText1 = document.getElementById('pageForgotAlertText1');
    const sendBtn = document.getElementById('pageForgotSendOtpBtn');

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        if (alert1) {
          alert1.classList.add('d-none');
          alert1.classList.remove('d-flex');
        }
        emailInput.classList.remove('is-invalid');
      });
    }

    if (form1) {
      form1.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput ? emailInput.value.trim() : '';
        if (!email) {
          if (alert1 && alertText1) {
            alertText1.textContent = 'Please enter your registered email address.';
            alert1.classList.remove('d-none');
            alert1.classList.add('d-flex');
          }
          if (emailInput) emailInput.classList.add('is-invalid');
          return;
        }

        if (sendBtn) {
          sendBtn.disabled = true;
          sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Sending 6-Digit Code...';
        }

        try {
          await AuthService.forgotPassword(email);
          ForgotPasswordPage.state.email = email;
          const targetEl = document.getElementById('pageForgotTargetEmail');
          if (targetEl) targetEl.textContent = email;

          ForgotPasswordPage.showStep(2);
          ForgotPasswordPage.startResendCountdown();

          const otpInput = document.getElementById('pageForgotOtpInput');
          if (otpInput) {
            otpInput.value = '';
            otpInput.focus();
          }
        } catch (err) {
          if (alert1 && alertText1) {
            alertText1.textContent = err.message || 'Unable to request code. Please check your email.';
            alert1.classList.remove('d-none');
            alert1.classList.add('d-flex');
          }
          if (emailInput) emailInput.classList.add('is-invalid');
        } finally {
          if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="bi bi-send me-2"></i> Send 6-Digit Code';
          }
        }
      });
    }

    // Back to email
    document.getElementById('pageForgotBackToEmailBtn')?.addEventListener('click', () => {
      ForgotPasswordPage.showStep(1);
    });

    // Resend OTP
    document.getElementById('pageForgotResendBtn')?.addEventListener('click', async () => {
      if (!ForgotPasswordPage.state.email) return;
      try {
        await AuthService.forgotPassword(ForgotPasswordPage.state.email);
        Toast.show(`New verification code sent to ${ForgotPasswordPage.state.email}`, 'info');
        ForgotPasswordPage.startResendCountdown();
      } catch (err) {
        Toast.show(err.message || 'Failed to resend code', 'error');
      }
    });

    // ------------------------------------
    // STEP 2: Verify OTP
    // ------------------------------------
    const form2 = document.getElementById('pageForgotOtpForm');
    const otpInput = document.getElementById('pageForgotOtpInput');
    const alert2 = document.getElementById('pageForgotAlert2');
    const alertText2 = document.getElementById('pageForgotAlertText2');
    const verifyBtn = document.getElementById('pageForgotVerifyBtn');

    if (otpInput) {
      otpInput.addEventListener('input', () => {
        if (alert2) {
          alert2.classList.add('d-none');
          alert2.classList.remove('d-flex');
        }
        otpInput.classList.remove('is-invalid');
      });
    }

    if (form2) {
      form2.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = otpInput ? otpInput.value.trim() : '';

        if (code.length !== 6) {
          if (alert2 && alertText2) {
            alertText2.textContent = 'Please enter the complete 6-digit code.';
            alert2.classList.remove('d-none');
            alert2.classList.add('d-flex');
          }
          if (otpInput) otpInput.classList.add('is-invalid');
          return;
        }

        if (verifyBtn) {
          verifyBtn.disabled = true;
          verifyBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Verifying...';
        }

        try {
          await AuthService.verifyOtp(ForgotPasswordPage.state.email, code);
          ForgotPasswordPage.state.otp = code;
          ForgotPasswordPage.showStep(3);

          const pass1Input = document.getElementById('pageForgotNewPass');
          if (pass1Input) {
            pass1Input.value = '';
            pass1Input.focus();
          }
        } catch (err) {
          if (alert2 && alertText2) {
            alertText2.textContent = err.message || 'Invalid or expired code. Please try again.';
            alert2.classList.remove('d-none');
            alert2.classList.add('d-flex');
          }
          if (otpInput) otpInput.classList.add('is-invalid');
        } finally {
          if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="bi bi-check2-circle me-2"></i> Verify Code';
          }
        }
      });
    }

    // ------------------------------------
    // STEP 3: Reset Password
    // ------------------------------------
    const form3 = document.getElementById('pageForgotNewPassForm');
    const passInput = document.getElementById('pageForgotNewPass');
    const confirmInput = document.getElementById('pageForgotConfirmPass');
    const alert3 = document.getElementById('pageForgotAlert3');
    const alertText3 = document.getElementById('pageForgotAlertText3');
    const saveBtn = document.getElementById('pageForgotSavePassBtn');

    [passInput, confirmInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          if (alert3) {
            alert3.classList.add('d-none');
            alert3.classList.remove('d-flex');
          }
          if (passInput) passInput.classList.remove('is-invalid');
          if (confirmInput) confirmInput.classList.remove('is-invalid');
        });
      }
    });

    if (form3) {
      form3.addEventListener('submit', async (e) => {
        e.preventDefault();
        const p1 = passInput ? passInput.value.trim() : '';
        const p2 = confirmInput ? confirmInput.value.trim() : '';

        if (p1.length < 6) {
          if (alert3 && alertText3) {
            alertText3.textContent = 'Password must be at least 6 characters long.';
            alert3.classList.remove('d-none');
            alert3.classList.add('d-flex');
          }
          if (passInput) passInput.classList.add('is-invalid');
          return;
        }

        if (p1 !== p2) {
          if (alert3 && alertText3) {
            alertText3.textContent = 'Passwords do not match. Please re-enter.';
            alert3.classList.remove('d-none');
            alert3.classList.add('d-flex');
          }
          if (confirmInput) confirmInput.classList.add('is-invalid');
          return;
        }

        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Updating Password...';
        }

        try {
          await AuthService.resetPassword(ForgotPasswordPage.state.email, ForgotPasswordPage.state.otp, p1);
          ForgotPasswordPage.showStep(4);
        } catch (err) {
          if (alert3 && alertText3) {
            alertText3.textContent = err.message || 'Failed to reset password. Please try again.';
            alert3.classList.remove('d-none');
            alert3.classList.add('d-flex');
          }
        } finally {
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i> Save New Password';
          }
        }
      });
    }
  }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ForgotPasswordPage.init());
} else {
  ForgotPasswordPage.init();
}
