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
      if (!CONFIG.USE_MOCK_DATA) {
        try {
          const response = await OrderAPI.getAllOrders({ page: 0, size: 50 });
          const list = Array.isArray(response) ? response : (response.content || []);
          if (list.length > 0) {
            AdminOrdersPage.ordersList = list.map(OrderService._normalizeOrder);
            AdminOrdersPage.renderTable(AdminOrdersPage.ordersList);
            return;
          }
        } catch (e) {
          console.warn('[AdminOrdersPage] Live getAllOrders failed, falling back:', e.message);
        }
      }

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

    if (!orders || orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
            No orders found matching this fulfillment filter.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    orders.forEach(order => {
      let badgeClass = 'badge-delivered';
      if (order.status === 'PENDING') badgeClass = 'badge-pending';
      else if (order.status === 'PROCESSING') badgeClass = 'badge-processing';
      else if (order.status === 'DISPATCHED') badgeClass = 'badge-dispatched';

      const itemCount = (order.items || []).length;

      html += `
        <tr data-id="${order.id || order.orderNumber}">
          <td>
            <strong class="text-navy small d-block">${order.orderNumber || ('KKP-2026-' + order.id)}</strong>
            <small class="text-muted">${itemCount} ${itemCount === 1 ? 'item' : 'items'} ordered</small>
          </td>
          <td>
            <div class="small fw-bold text-navy">${order.customerName || 'Sarah Perera'}</div>
            <small class="text-muted">${order.shippingAddress ? (order.shippingAddress.length > 28 ? order.shippingAddress.substring(0, 28) + '...' : order.shippingAddress) : 'Colombo, Sri Lanka'}</small>
          </td>
          <td><span class="small text-muted">${order.date || '2026-09-23'}</span></td>
          <td><strong class="text-primary small">Rs. ${(parseFloat(order.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
          <td><span class="badge-payment-method">${order.paymentMethod || 'Credit Card'}</span></td>
          <td><span class="badge-status ${badgeClass}" id="badge-${order.id}">${order.status}</span></td>
          <td class="text-end">
            <div class="d-inline-flex align-items-center gap-2">
              <button type="button" class="btn btn-sm btn-outline-primary btn-view-order rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm" 
                      data-id="${order.id || order.orderNumber}" 
                      title="View Order Items & Patient Receipt" 
                      style="width: 32px; height: 32px;">
                <i class="bi bi-eye-fill"></i>
              </button>
              <select class="form-select form-select-sm status-updater-select d-inline-block" data-id="${order.id || order.orderNumber}" style="width: 130px;">
                <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                <option value="PROCESSING" ${order.status === 'PROCESSING' ? 'selected' : ''}>Processing</option>
                <option value="DISPATCHED" ${order.status === 'DISPATCHED' ? 'selected' : ''}>Dispatched</option>
                <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
              </select>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  /**
   * Open Professional Order Breakdown Modal
   */
  showOrderDetailsModal: async (orderId) => {
    let order = AdminOrdersPage.ordersList.find(o => String(o.id) === String(orderId) || String(o.orderNumber) === String(orderId));
    
    // If not in local list, attempt to fetch directly via API
    if (!order) {
      try {
        order = await OrderService.getOrderById(orderId);
      } catch (err) {
        console.warn('[AdminOrdersPage] Could not fetch single order:', err);
      }
    }

    if (!order) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Order Not Found',
          text: `Could not retrieve details for Order #${orderId}`,
          confirmButtonColor: '#003B66'
        });
      }
      return;
    }

    // 1. Header Information
    const orderRefEl = document.getElementById('modalOrderRef');
    const orderDateEl = document.getElementById('modalOrderDate');
    const paymentStatusEl = document.getElementById('modalPaymentStatus');
    
    if (orderRefEl) orderRefEl.textContent = order.orderNumber || `#KKP-2026-${order.id}`;
    if (orderDateEl) orderDateEl.textContent = order.date || 'Today';
    if (paymentStatusEl) {
      paymentStatusEl.textContent = order.paymentStatus || 'PAID';
      paymentStatusEl.className = order.paymentStatus === 'PAID' || order.paymentStatus === 'COMPLETED' 
        ? 'badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 rounded-pill'
        : 'badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-0.5 rounded-pill';
    }

    // 2. Patient & Delivery Information
    const customerNameEl = document.getElementById('modalCustomerName');
    const customerEmailEl = document.getElementById('modalCustomerEmail');
    const customerPhoneEl = document.getElementById('modalCustomerPhone');
    const shippingAddressEl = document.getElementById('modalShippingAddress');
    const paymentMethodEl = document.getElementById('modalPaymentMethod');
    const trackingIdEl = document.getElementById('modalTrackingId');

    if (customerNameEl) customerNameEl.textContent = order.customerName || 'Valued Patient';
    if (customerEmailEl) customerEmailEl.innerHTML = `<i class="bi bi-envelope me-1"></i> ${order.customerEmail || 'user@example.com'}`;
    if (customerPhoneEl) customerPhoneEl.innerHTML = `<i class="bi bi-telephone me-1"></i> ${order.phone || order.customerPhone || '+94 77 123 4567'}`;
    if (shippingAddressEl) shippingAddressEl.textContent = order.shippingAddress || 'Colombo, Sri Lanka';
    if (paymentMethodEl) paymentMethodEl.textContent = order.paymentMethod || 'Credit Card';
    if (trackingIdEl) trackingIdEl.textContent = order.trackingId || `MED-TRK-${order.id || 'PENDING'}`;

    // 3. Itemized Ordered Items Table
    const itemsTbody = document.getElementById('modalOrderItemsTableBody');
    const itemsCountBadge = document.getElementById('modalItemsCount');
    const items = order.items || [];

    if (itemsCountBadge) itemsCountBadge.textContent = `${items.length} ${items.length === 1 ? 'Item' : 'Items'}`;

    if (itemsTbody) {
      if (items.length === 0) {
        itemsTbody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4 text-muted">
              No items recorded for this order reference.
            </td>
          </tr>
        `;
      } else {
        let itemsHtml = '';
        items.forEach(item => {
          const unitPrice = parseFloat(item.price || item.unitPrice) || 0;
          const qty = parseInt(item.quantity, 10) || 1;
          const lineTotal = unitPrice * qty;
          const imgSrc = item.image ? (item.image.startsWith('http') || item.image.startsWith('../') ? item.image : `../${item.image}`) : '../assets/images/medicine_1.png';

          itemsHtml += `
            <tr>
              <td>
                <div class="rounded-3 p-1 bg-light border d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; overflow: hidden;">
                  <img src="${imgSrc}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='../assets/images/medicine_1.png'">
                </div>
              </td>
              <td>
                <div class="fw-semibold text-navy small">${item.name || item.productName || 'Healthcare Item'}</div>
                <div class="text-muted" style="font-size: 0.75rem;">SKU: MED-PROD-${item.productId || item.id || '00'}</div>
              </td>
              <td class="text-center small text-dark">
                Rs. ${unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td class="text-center">
                <span class="badge bg-secondary-subtle text-secondary px-2 py-1 rounded-pill small fw-bold">x ${qty}</span>
              </td>
              <td class="text-end fw-bold text-navy small">
                Rs. ${lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          `;
        });
        itemsTbody.innerHTML = itemsHtml;
      }
    }

    // 4. Financial Calculations & Summary
    const subtotal = parseFloat(order.subtotal) || (items.reduce((sum, i) => sum + ((parseFloat(i.price) || 0) * (parseInt(i.quantity, 10) || 1)), 0));
    const deliveryFee = parseFloat(order.deliveryFee) || 0;
    const discount = parseFloat(order.discount) || 0;
    const grandTotal = parseFloat(order.total || order.totalAmount) || (subtotal + deliveryFee - discount);

    const subtotalEl = document.getElementById('modalSubtotal');
    const deliveryFeeEl = document.getElementById('modalDeliveryFee');
    const discountEl = document.getElementById('modalDiscount');
    const discountRow = document.getElementById('modalDiscountRow');
    const grandTotalEl = document.getElementById('modalGrandTotal');

    if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (deliveryFeeEl) deliveryFeeEl.textContent = deliveryFee > 0 ? `Rs. ${deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Free Delivery (Rs. 0.00)';
    if (discountEl) discountEl.textContent = `- Rs. ${discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (discountRow) discountRow.style.display = discount > 0 ? 'flex' : 'none';
    if (grandTotalEl) grandTotalEl.textContent = `Rs. ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    // 5. Quick Status in Modal Footer
    const quickStatusSelect = document.getElementById('modalQuickStatusSelect');
    if (quickStatusSelect) {
      quickStatusSelect.value = order.status || 'PENDING';
      quickStatusSelect.setAttribute('data-id', order.id || order.orderNumber);
    }

    // 6. Launch Bootstrap Modal
    const modalElement = document.getElementById('adminOrderDetailsModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
      modalInstance.show();
    }
  },

  attachListeners: () => {
    const tbody = document.getElementById('adminOrdersTableBody');
    if (tbody) {
      // Status updater change in table
      tbody.addEventListener('change', async (e) => {
        const select = e.target.closest('.status-updater-select');
        if (select) {
          const orderId = select.getAttribute('data-id');
          const newStatus = select.value;
          try {
            await AdminService.updateOrderStatus(orderId, newStatus);
            if (typeof Swal !== 'undefined') {
              Swal.fire({
                icon: 'success',
                title: 'Status Updated',
                text: `Order #${orderId} status set to ${newStatus}`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
              });
            } else {
              Toast.show(`Order #${orderId} status updated to: ${newStatus}`, 'success');
            }
            await AdminOrdersPage.loadOrders();
          } catch (err) {
            Toast.show('Failed to update order status.', 'error');
          }
        }
      });

      // Eye Button Click to Open Order Details
      tbody.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.btn-view-order');
        if (viewBtn) {
          e.preventDefault();
          const orderId = viewBtn.getAttribute('data-id');
          if (orderId) {
            AdminOrdersPage.showOrderDetailsModal(orderId);
          }
        }
      });
    }

    // Modal Quick Status Change
    const quickStatusSelect = document.getElementById('modalQuickStatusSelect');
    if (quickStatusSelect) {
      quickStatusSelect.addEventListener('change', async (e) => {
        const orderId = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        if (!orderId) return;

        try {
          await AdminService.updateOrderStatus(orderId, newStatus);
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'success',
              title: 'Status Updated',
              text: `Order #${orderId} changed to ${newStatus}`,
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          }
          await AdminOrdersPage.loadOrders();
        } catch (err) {
          Toast.show('Failed to update status from modal.', 'error');
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

