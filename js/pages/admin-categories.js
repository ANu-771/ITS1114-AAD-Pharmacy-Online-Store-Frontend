/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN CATEGORIES CONTROLLER (js/pages/admin-categories.js)
 * Manages category list rendering, creation modal, and status display.
 */
const AdminCategoriesPage = {
  categoriesList: [],

  init: async () => {
    AdminSidebarComponent.render('categories');
    await AdminCategoriesPage.loadCategories();
    AdminCategoriesPage.attachListeners();
  },

  loadCategories: async () => {
    try {
      const data = await ProductService.getCategories();
      AdminCategoriesPage.categoriesList = [...data];
      AdminCategoriesPage.renderTable(AdminCategoriesPage.categoriesList);
    } catch (e) {
      console.error('[AdminCategoriesPage] Error:', e);
    }
  },

  renderTable: (categories) => {
    const tbody = document.getElementById('adminCategoriesTableBody');
    const countLabel = document.getElementById('categoryCountLabel');
    if (!tbody) return;

    if (countLabel) countLabel.textContent = `${categories.length} Active Departments`;

    let html = '';
    categories.forEach(cat => {
      html += `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="bg-primary-subtle text-primary p-2 rounded-2 fs-5" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
                <i class="bi ${cat.icon || 'bi-capsule'}"></i>
              </div>
              <strong class="text-navy small">${cat.name}</strong>
            </div>
          </td>
          <td><code>${cat.id}</code></td>
          <td><span class="small text-muted">${cat.desc || 'General category'}</span></td>
          <td><span class="badge bg-light text-navy border small">${cat.count || 'N/A'}</span></td>
          <td><span class="badge-status badge-instock"><i class="bi bi-check-circle-fill"></i> Active</span></td>
          <td class="text-end">
            <a href="../pages/products.html?category=${cat.id}" class="btn-action-icon" title="View in Storefront" target="_blank">
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  attachListeners: () => {
    const form = document.getElementById('addCategoryForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCat = {
          id: document.getElementById('catSlugInput').value.trim().toLowerCase(),
          name: document.getElementById('catNameInput').value.trim(),
          icon: document.getElementById('catIconInput').value.trim() || 'bi-capsule',
          desc: document.getElementById('catDescInput').value.trim() || 'Newly added pharmacy department',
          count: '0 Products'
        };

        AdminCategoriesPage.categoriesList.push(newCat);
        AdminCategoriesPage.renderTable(AdminCategoriesPage.categoriesList);

        const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
        if (modal) modal.hide();
        form.reset();
        Toast.show(`Category "${newCat.name}" created successfully!`, 'success');
      });
    }
  }
};
