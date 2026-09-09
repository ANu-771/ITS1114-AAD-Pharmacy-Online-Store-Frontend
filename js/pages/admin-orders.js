/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN ORDERS CONTROLLER (js/pages/admin-orders.js)
 * Manages order fulfillment queue, status filtering, and live state updates.
 */
const AdminOrdersPage = {
  ordersList: [],

  init: async () => {
    AdminSidebarComponent.render('orders');
    await AdminOrdersPage.loadOrders();
    AdminOrdersPage.attachListeners();
  },

  loadOrders: async () => {
    try {
      const data = await OrderService.getMyOrders();
      AdminOrdersPage.ordersList = data;
      AdminOrdersPage.renderTable(data);
    } catch (e) {
      console.error('[AdminOrdersPage] Error:', e);
    }
  },

  renderTable: (orders) => {
    const tbody = document.getElementById('adminOrdersTableBody');
    const countLabel = document.getElementById('ordersCountLabel');
    if (!tbody) return;

    if (countLabel) countLabel.textContent = `Showing ${orders.length} Orders`;

    let html = '';
    orders.forEach(order => {
      let badgeClass = 'badge-delivered';
      if (order.status === 'PENDING') badgeClass = 'badge-pending';
      else if (order.status === 'PROCESSING') badgeClass = 'badge-processing';
      else if (order.status === 'DISPATCHED') badgeClass = 'badge-dispatched';

      html += `
        <tr data-id="${order.id || order.orderNumber}">
          <td>
            <strong class="text-navy small d-block">${order.orderNumber || order.id}</strong>
            <small class="text-muted">${order.items.length} items ordered</small>
          </td>
          <td>
            <div class="small fw-bold text-navy">${order.customerName || 'Sarah Perera'}</div>
            <small class="text-muted">${order.shippingAddress ? order.shippingAddress.substring(0, 30) + '...' : 'Colombo'}</small>
          </td>
          <td><span class="small text-muted">${order.date || '2026-08-28'}</span></td>
          <td><strong class="text-primary small">Rs. ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
          <td><span class="badge bg-light text-navy border small">${order.paymentMethod || 'Credit Card'}</span></td>
          <td><span class="badge-status ${badgeClass}" id="badge-${order.id}">${order.status}</span></td>
          <td class="text-end">
            <select class="form-select form-select-sm status-updater-select d-inline-block" data-id="${order.id || order.orderNumber}" style="width: 140px;">
              <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
              <option value="PROCESSING" ${order.status === 'PROCESSING' ? 'selected' : ''}>Processing</option>
              <option value="DISPATCHED" ${order.status === 'DISPATCHED' ? 'selected' : ''}>Dispatched</option>
              <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
            </select>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  attachListeners: () => {
    // Status updater change
    const tbody = document.getElementById('adminOrdersTableBody');
    if (tbody) {
      tbody.addEventListener('change', async (e) => {
        const select = e.target.closest('.status-updater-select');
        if (select) {
          const orderId = select.getAttribute('data-id');
          const newStatus = select.value;
          try {
            await AdminService.updateOrderStatus(orderId, newStatus);
            Toast.show(`Order ${orderId} updated to status: ${newStatus}`, 'success');
            await AdminOrdersPage.loadOrders();
          } catch (err) {
            Toast.show('Failed to update order status.', 'error');
          }
        }
      });
    }

    // Filter Tabs
    document.querySelectorAll('.order-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.order-filter-btn').forEach(b => {
          b.classList.remove('btn-primary-pharmacy');
          b.classList.add('btn-outline-secondary');
        });
        btn.classList.add('btn-primary-pharmacy');
        btn.classList.remove('btn-outline-secondary');

        const status = btn.getAttribute('data-status');
        if (status === 'ALL') {
          AdminOrdersPage.renderTable(AdminOrdersPage.ordersList);
        } else {
          const filtered = AdminOrdersPage.ordersList.filter(o => o.status === status);
          AdminOrdersPage.renderTable(filtered);
        }
      });
    });
  }
};
