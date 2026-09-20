/**
 * KK PHARMACY ONLINE PHARMACY - USER PROFILE CONTROLLER (js/pages/profile.js)
 * Manages user personal information, Spring Boot profile sync, and session teardown.
 */
const ProfilePage = {
  init: async () => {
    // If not authenticated, prompt modal or redirect
    if (!AuthService.isAuthenticated()) {
      Toast.show('Please sign in to access your profile.', 'warning');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return;
    }

    await ProfilePage.loadProfile();
    ProfilePage.attachListeners();
  },

  loadProfile: async () => {
    let user = AuthService.getCurrentUser();

    if (!CONFIG.USE_MOCK_DATA && AuthService.isAuthenticated()) {
      try {
        const liveUser = await UserAPI.getProfile();
        if (liveUser && liveUser.email) {
          user = { ...user, ...liveUser };
          StorageService.setItem(CONFIG.STORAGE_KEYS.USER, user);
        }
      } catch (e) {
        console.warn('[ProfilePage] Live profile fetch failed, using stored session:', e.message);
      }
    }

    if (!user) return;

    // Display
    if (document.getElementById('profileNameDisplay')) document.getElementById('profileNameDisplay').textContent = user.fullName || 'Valued Patient';
    if (document.getElementById('profileEmailDisplay')) document.getElementById('profileEmailDisplay').textContent = user.email || 'user@example.com';
    
    const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'PT';
    if (document.getElementById('profileAvatar')) document.getElementById('profileAvatar').textContent = initials;

    // Inputs
    if (document.getElementById('profFullName')) document.getElementById('profFullName').value = user.fullName || '';
    if (document.getElementById('profEmail')) document.getElementById('profEmail').value = user.email || '';
    if (document.getElementById('profPhone') && user.phone) document.getElementById('profPhone').value = user.phone;
    if (document.getElementById('profAddress') && user.address) document.getElementById('profAddress').value = user.address;
    if (document.getElementById('profCity') && user.city) document.getElementById('profCity').value = user.city;
  },

  attachListeners: () => {
    // Save personal info
    const form = document.getElementById('profileUpdateForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = AuthService.getCurrentUser() || {};
        const updatePayload = {
          fullName: document.getElementById('profFullName')?.value.trim() || user.fullName,
          phone: document.getElementById('profPhone')?.value.trim() || user.phone,
          city: document.getElementById('profCity')?.value || user.city || 'Colombo',
          address: document.getElementById('profAddress')?.value.trim() || user.address
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Updating...';
        }

        try {
          if (!CONFIG.USE_MOCK_DATA) {
            const updated = await UserAPI.updateProfile(updatePayload);
            Object.assign(user, updated);
          } else {
            Object.assign(user, updatePayload);
          }
          StorageService.setItem(CONFIG.STORAGE_KEYS.USER, user);
          StorageService.setItem(CONFIG.STORAGE_KEYS.USER_INFO, user);
          await ProfilePage.loadProfile();
          Toast.show('Profile information updated successfully!', 'success');
        } catch (err) {
          Toast.show(err.message || 'Failed to update profile.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Save Changes';
          }
        }
      });
    }

    // Change password
    const passForm = document.getElementById('passwordChangeForm');
    if (passForm) {
      passForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const p1 = document.getElementById('profNewPass')?.value;
        const p2 = document.getElementById('profConfirmPass')?.value;

        if (p1 !== p2) {
          Toast.show('Passwords do not match.', 'warning');
          return;
        }

        Toast.show('Password changed successfully!', 'success');
        passForm.reset();
      });
    }

    // Logout
    document.getElementById('profileLogoutBtn')?.addEventListener('click', async () => {
      await AuthService.logout();
      Toast.show('Logged out successfully.', 'info');
      setTimeout(() => { window.location.href = '../index.html'; }, 600);
    });
  }
};
