/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN USERS CONTROLLER (js/pages/admin-users.js)
 * Manages user accounts listing, role badge rendering, and active/disabled state toggles.
 */
const AdminUsersPage = {
  usersList: [],

  init: async () => {
    AdminSidebarComponent.render('users');
    await AdminUsersPage.loadUsers();
    AdminUsersPage.attachListeners();
  },

  loadUsers: async () => {
    try {
      const data = await AdminService.getUsers();
      AdminUsersPage.usersList = data;
      AdminUsersPage.renderTable(data);
    } catch (e) {
      console.error('[AdminUsersPage] Error:', e);
    }
  },

  renderTable: (users) => {
    const tbody = document.getElementById('adminUsersTableBody');
    const countEl = document.getElementById('userTotalCount');
    if (!tbody) return;

    if (countEl) countEl.textContent = `${users.length} Accounts`;

    let html = '';
    users.forEach(user => {
      const isAdmin = user.role === 'ROLE_ADMIN';
      const roleBadge = isAdmin
        ? '<span class="badge bg-danger-subtle text-danger border border-danger-subtle"><i class="bi bi-shield-lock-fill me-1"></i>ROLE_ADMIN</span>'
        : '<span class="badge bg-primary-subtle text-primary border border-primary-subtle"><i class="bi bi-person-fill me-1"></i>ROLE_USER</span>';

      const statusBadge = user.status === 'ACTIVE'
        ? '<span class="badge-status badge-instock"><i class="bi bi-check-circle-fill"></i> Active</span>'
        : '<span class="badge-status badge-outofstock"><i class="bi bi-x-circle-fill"></i> Disabled</span>';

      html += `
        <tr data-id="${user.id}">
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="rounded-circle bg-light border text-navy fw-bold small d-flex align-items-center justify-content-center" style="width: 34px; height: 34px;">
                ${user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div>
                <strong class="text-navy small d-block">${user.fullName}</strong>
                <small class="text-muted">ID: #USR-${user.id}</small>
              </div>
            </div>
          </td>
          <td><code class="text-navy small">${user.email}</code></td>
          <td><span class="small text-muted">${user.phone}</span></td>
          <td>${roleBadge}</td>
          <td>${statusBadge}</td>
          <td><span class="small text-muted">${user.joinDate}</span></td>
          <td class="text-end">
            <button class="btn btn-sm ${user.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'} btn-toggle-status" data-id="${user.id}">
              ${user.status === 'ACTIVE' ? '<i class="bi bi-person-x me-1"></i> Disable' : '<i class="bi bi-person-check me-1"></i> Activate'}
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  attachListeners: () => {
    const tbody = document.getElementById('adminUsersTableBody');
    if (tbody) {
      tbody.addEventListener('click', async (e) => {
        const toggleBtn = e.target.closest('.btn-toggle-status');
        if (toggleBtn) {
          const userId = parseInt(toggleBtn.getAttribute('data-id'), 10);
          try {
            const updated = await AdminService.toggleUserStatus(userId);
            Toast.show(`Account for ${updated.fullName} is now ${updated.status}.`, 'info');
            await AdminUsersPage.loadUsers();
          } catch (err) {
            Toast.show('Failed to toggle user status.', 'error');
          }
        }
      });
    }
  }
};
