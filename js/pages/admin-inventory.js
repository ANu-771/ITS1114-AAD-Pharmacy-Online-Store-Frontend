/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN INVENTORY CONTROLLER (js/pages/admin-inventory.js)
 * Manages inventory stock tables, batch expiration tracking, and inward stock intake via Spring Boot API.
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
      const isLow = item.stock <= (item.reorderLevel || 10);
      const statusBadge = isLow
        ? '<span class="badge-status badge-lowstock"><i class="bi bi-exclamation-triangle-fill"></i> Low Stock</span>'
        : '<span class="badge-status badge-instock"><i class="bi bi-check-circle-fill"></i> Optimal</span>';

      html += `
        <tr>
          <td>
            <strong class="text-navy small d-block">${item.name}</strong>
            <small class="text-muted">SKU: <code>${item.sku}</code></small>
          </td>
          <td><span class="badge-category-yellow">${item.category}</span></td>
          <td><strong class="text-navy">${item.stock} units</strong></td>
          <td><span class="small text-muted">${item.reorderLevel || 10} units</span></td>
          <td><code>${item.batch || 'N/A'}</code></td>
          <td><span class="small ${String(item.expiry).startsWith('2026') ? 'text-danger fw-bold' : 'text-muted'}">${item.expiry || 'N/A'}</span></td>
          <td>${statusBadge}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  attachListeners: () => {
    const form = document.getElementById('inwardBatchForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prodId = parseInt(document.getElementById('batchProdSelect').value, 10);
        const batchNum = document.getElementById('batchNumberInput').value.trim();
        const qty = parseInt(document.getElementById('batchQtyInput').value, 10);
        const expiry = document.getElementById('batchExpiryInput').value;

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Inwarding...';
        }

        try {
          await AdminService.addBatch({
            productId: prodId,
            batchNumber: batchNum,
            quantity: qty,
            expiryDate: expiry,
            manufacturer: 'Certified Pharma Supplier'
          });

          const modalEl = document.getElementById('addBatchModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
          form.reset();
          Toast.show(`Received ${qty} units for Batch ${batchNum}. Stock updated!`, 'success');
          await AdminInventoryPage.loadInventory();
        } catch (err) {
          Toast.show(err.message || 'Failed to record batch.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-down me-1"></i> Receive Inward Batch';
          }
        }
      });
    }
  }
};
