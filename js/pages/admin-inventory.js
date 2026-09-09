/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN INVENTORY CONTROLLER (js/pages/admin-inventory.js)
 * Manages inventory stock tables, batch expiration tracking, and inward stock intake.
 */
const AdminInventoryPage = {
  inventoryList: [],

  init: async () => {
    AdminSidebarComponent.render('inventory');
    await AdminInventoryPage.loadInventory();
    AdminInventoryPage.attachListeners();
  },

  loadInventory: async () => {
    try {
      const data = await AdminService.getInventory();
      AdminInventoryPage.inventoryList = data;
      AdminInventoryPage.renderTable(data);
    } catch (e) {
      console.error('[AdminInventoryPage] Error:', e);
    }
  },

  renderTable: (inventory) => {
    const tbody = document.getElementById('adminInventoryTableBody');
    if (!tbody) return;

    let html = '';
    inventory.forEach(item => {
      const isLow = item.stock <= item.reorderLevel;
      const statusBadge = isLow
        ? '<span class="badge-status badge-lowstock"><i class="bi bi-exclamation-triangle-fill"></i> Low Stock</span>'
        : '<span class="badge-status badge-instock"><i class="bi bi-check-circle-fill"></i> Optimal</span>';

      html += `
        <tr>
          <td>
            <strong class="text-navy small d-block">${item.name}</strong>
            <small class="text-muted">SKU: <code>${item.sku}</code></small>
          </td>
          <td><span class="badge bg-light text-navy border small">${item.category}</span></td>
          <td><strong class="text-navy">${item.stock} units</strong></td>
          <td><span class="small text-muted">${item.reorderLevel} units</span></td>
          <td><code>${item.batch}</code></td>
          <td><span class="small ${item.expiry.startsWith('2026') ? 'text-danger fw-bold' : 'text-muted'}">${item.expiry}</span></td>
          <td>${statusBadge}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  attachListeners: () => {
    const form = document.getElementById('inwardBatchForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const prodId = parseInt(document.getElementById('batchProdSelect').value, 10);
        const batchNum = document.getElementById('batchNumberInput').value.trim();
        const qty = parseInt(document.getElementById('batchQtyInput').value, 10);
        const expiry = document.getElementById('batchExpiryInput').value;

        const item = AdminInventoryPage.inventoryList.find(i => i.id === prodId);
        if (item) {
          item.stock += qty;
          item.batch = batchNum;
          item.expiry = expiry;
          StorageService.setItem('medora_admin_inventory', AdminInventoryPage.inventoryList);
          AdminInventoryPage.renderTable(AdminInventoryPage.inventoryList);
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('addBatchModal'));
        if (modal) modal.hide();
        form.reset();
        Toast.show(`Received ${qty} units for Batch ${batchNum}. Stock updated!`, 'success');
      });
    }
  }
};
