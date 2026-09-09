/**
 * KK PHARMACY ONLINE PHARMACY - USER PROFILE CONTROLLER (js/pages/profile.js)
 * Manages user personal information, address management, and password update simulations.
 */
const ProfilePage = {
  init: () => {
    // If not authenticated, prompt modal or redirect
    if (!AuthService.isAuthenticated()) {
      Toast.show('Please sign in to access your profile.', 'warning');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return;
    }

    ProfilePage.loadProfile();
    ProfilePage.attachListeners();
  },

  loadProfile: () => {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    // Display
    document.getElementById('profileNameDisplay').textContent = user.fullName || 'Valued Patient';
    document.getElementById('profileEmailDisplay').textContent = user.email || 'user@example.com';
    
    const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'PT';
    document.getElementById('profileAvatar').textContent = initials;

    // Inputs
    if (document.getElementById('profFullName')) document.getElementById('profFullName').value = user.fullName || '';
    if (document.getElementById('profEmail')) document.getElementById('profEmail').value = user.email || '';
    if (document.getElementById('profPhone') && user.phone) document.getElementById('profPhone').value = user.phone;
    if (document.getElementById('profAddress') && user.address) document.getElementById('profAddress').value = user.address;
  },

  attachListeners: () => {
    // Save personal info
    const form = document.getElementById('profileUpdateForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = AuthService.getCurrentUser() || {};
        user.fullName = document.getElementById('profFullName').value.trim();
        user.phone = document.getElementById('profPhone').value.trim();
        user.city = document.getElementById('profCity').value;
        user.address = document.getElementById('profAddress').value.trim();

        StorageService.setItem(CONFIG.STORAGE_KEYS.USER_INFO, user);
        ProfilePage.loadProfile();
        Toast.show('Profile information updated successfully!', 'success');
      });
    }

    // Change password
    const passForm = document.getElementById('passwordChangeForm');
    if (passForm) {
      passForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const p1 = document.getElementById('profNewPass').value;
        const p2 = document.getElementById('profConfirmPass').value;

        if (p1 !== p2) {
          Toast.show('Passwords do not match.', 'warning');
          return;
        }

        Toast.show('Password changed successfully!', 'success');
        passForm.reset();
      });
    }

    // Logout
    document.getElementById('profileLogoutBtn')?.addEventListener('click', () => {
      AuthService.logout();
      Toast.show('Logged out successfully.', 'info');
      setTimeout(() => { window.location.href = '../index.html'; }, 800);
    });
  }
};
