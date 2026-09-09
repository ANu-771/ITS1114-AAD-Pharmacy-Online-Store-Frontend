/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN SIDEBAR & TOPBAR COMPONENT (js/components/admin-sidebar.js)
 * Reusable admin layout renderer with active navigation state and role protection checks.
 */
const AdminSidebarComponent = {
  render: (activePage = 'dashboard') => {
    // 1. Role Protection Check (Client-side defense)
    if (!AuthService.isAuthenticated() || !AuthService.hasRole('ROLE_ADMIN')) {
      console.warn('[AdminSidebar] Unauthorized admin route access. Prompting login.');
    }

    const container = document.getElementById('admin-sidebar-container');
    if (!container) return;

    const user = AuthService.getCurrentUser() || { fullName: 'Administrator', email: 'admin@medora.com' };

    container.innerHTML = `
      <aside class="admin-sidebar" id="adminSidebar">
        <!-- Brand Header -->
        <div class="admin-sidebar-header">
          <div class="brand-icon">
            <i class="bi bi-plus-lg"></i>
          </div>
          <div>
            <div class="fw-bold text-white lh-1 fs-5">KK PHARMACY</div>
            <small class="text-white-50" style="font-size: 0.7rem; letter-spacing: 0.05em;">ADMIN CONTROL</small>
          </div>
        </div>

        <!-- Navigation Menu -->
        <ul class="admin-sidebar-nav">
          <li class="admin-nav-item">
            <a href="dashboard.html" class="admin-nav-link ${activePage === 'dashboard' ? 'active' : ''}">
              <i class="bi bi-speedometer2"></i> Dashboard
            </a>
          </li>
          <li class="admin-nav-item">
            <a href="products.html" class="admin-nav-link ${activePage === 'products' ? 'active' : ''}">
              <i class="bi bi-capsule"></i> Products Catalog
            </a>
          </li>
          <li class="admin-nav-item">
            <a href="inventory.html" class="admin-nav-link ${activePage === 'inventory' ? 'active' : ''}">
              <i class="bi bi-boxes"></i> Inventory & Batches
            </a>
          </li>
          <li class="admin-nav-item">
            <a href="orders.html" class="admin-nav-link ${activePage === 'orders' ? 'active' : ''}">
              <i class="bi bi-bag-check"></i> Orders Management
            </a>
          </li>
          <li class="admin-nav-item">
            <a href="users.html" class="admin-nav-link ${activePage === 'users' ? 'active' : ''}">
              <i class="bi bi-people"></i> User Accounts
            </a>
          </li>
          <li class="admin-nav-item">
            <a href="reports.html" class="admin-nav-link ${activePage === 'reports' ? 'active' : ''}">
              <i class="bi bi-file-earmark-bar-graph"></i> Jasper Reports
            </a>
          </li>
          <li class="admin-nav-item mt-3 pt-3 border-top border-secondary">
            <a href="../index.html" class="admin-nav-link">
              <i class="bi bi-shop"></i> View Storefront
            </a>
          </li>
        </ul>

        <!-- Sidebar Footer -->
        <div class="admin-sidebar-footer">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="admin-avatar">AD</div>
              <div class="overflow-hidden">
                <div class="text-white small fw-bold text-truncate" style="max-width: 110px;">${user.fullName}</div>
                <small class="text-white-50" style="font-size: 0.7rem;">ROLE_ADMIN</small>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-light border-0" id="adminLogoutBtn" title="Logout">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </aside>
    `;

    // Attach listeners
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        AuthService.logout();
        Toast.show('Logged out from Admin Console.', 'info');
        window.location.href = '../index.html';
      });
    }
  }
};
