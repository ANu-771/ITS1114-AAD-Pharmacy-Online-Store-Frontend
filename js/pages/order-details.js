/**
 * KK PHARMACY ONLINE PHARMACY - ORDER DETAILS CONTROLLER (js/pages/order-details.js)
 * Manages order invoice display, live tracking timeline state transitions, and itemized breakdown.
 */
const OrderDetailsPage = {
  init: async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('id') || 'ORD-89421';

      const order = await OrderService.getOrderById(orderId);
      if (!order) {
        Toast.show('Order not found.', 'error');
        return;
      }

      OrderDetailsPage.renderInvoice(order);
    } catch (err) {
      console.error('[OrderDetailsPage] Error:', err);
    }
  },

  renderInvoice: (order) => {
    document.title = `Invoice #${order.orderNumber || order.id} — KK PHARMACY`;

    // Headers & ID
    if (document.getElementById('orderBreadcrumbId')) document.getElementById('orderBreadcrumbId').textContent = order.orderNumber || order.id;
    if (document.getElementById('orderHeaderTitle')) document.getElementById('orderHeaderTitle').textContent = `Order #${order.orderNumber || order.id}`;
    if (document.getElementById('orderHeaderDate')) document.getElementById('orderHeaderDate').textContent = `Placed on ${order.date || 'Today'}`;
    
    // Status Badge
    const statusBadge = document.getElementById('orderStatusBadge');
    if (statusBadge) {
      statusBadge.textContent = order.status;
      if (order.status === 'DELIVERED') {
        statusBadge.className = 'badge bg-success text-white border-0';
      } else if (order.status === 'PROCESSING') {
        statusBadge.className = 'badge bg-primary text-white border-0';
      } else if (order.status === 'DISPATCHED') {
        statusBadge.className = 'badge bg-info text-dark border-0';
      } else {
        statusBadge.className = 'badge bg-warning text-dark border-0';
      }
    }

    // Tracking Stepper Updates
    OrderDetailsPage.updateTimeline(order.status);
    if (document.getElementById('orderTrackingId')) document.getElementById('orderTrackingId').textContent = order.trackingId || 'MED-TRK-PENDING';
    if (document.getElementById('orderEstDelivery')) document.getElementById('orderEstDelivery').textContent = order.estimatedDelivery || 'In 2 business days';

    // Itemized Table
    const tbody = document.getElementById('invoiceItemsTbody');
    if (tbody && order.items) {
      let html = '';
      order.items.forEach(item => {
        const lineTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1);
        const imgSrc = resolveImagePath(item.image);
        const fallbackImg = resolveImagePath('assets/images/medicine_1.png');

        html += `
          <tr>
            <td class="ps-4 py-3">
              <div class="d-flex align-items-center gap-3">
                <img src="${imgSrc}" alt="${item.name}" class="rounded-2 border p-1" style="width: 45px; height: 45px; object-fit: contain; background: #FFF;" onerror="this.onerror=null; this.src='${fallbackImg}';">
                <div>
                  <strong class="text-navy small d-block">${item.name}</strong>
                  <small class="text-muted">Item Ref: #MED-SKU-${item.id}</small>
                </div>
              </div>
            </td>
            <td class="py-3 text-center small text-navy">
              Rs. ${(parseFloat(item.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </td>
            <td class="py-3 text-center small fw-bold">
              ${item.quantity}
            </td>
            <td class="pe-4 py-3 text-end fw-bold text-primary small">
              Rs. ${lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }

    // Delivery & Payment
    if (document.getElementById('invoiceCustName')) document.getElementById('invoiceCustName').textContent = order.customerName || 'Sarah Perera';
    if (document.getElementById('invoiceAddress')) document.getElementById('invoiceAddress').textContent = order.shippingAddress || 'No. 45, Galle Road, Colombo 03';
    if (document.getElementById('invoicePayment')) document.getElementById('invoicePayment').textContent = order.paymentMethod || 'Credit Card';

    if (document.getElementById('invoiceSubtotal')) document.getElementById('invoiceSubtotal').textContent = `Rs. ${(parseFloat(order.subtotal) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (document.getElementById('invoiceDelivery')) document.getElementById('invoiceDelivery').textContent = (order.deliveryFee === 0 || !order.deliveryFee) ? 'FREE' : `Rs. ${parseFloat(order.deliveryFee).toFixed(2)}`;
    if (document.getElementById('invoiceGrandTotal')) document.getElementById('invoiceGrandTotal').textContent = `Rs. ${(parseFloat(order.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  },

  updateTimeline: (status) => {
    const s1 = document.getElementById('step1');
    const s2 = document.getElementById('step2');
    const s3 = document.getElementById('step3');
    const s4 = document.getElementById('step4');

    // Reset
    [s1, s2, s3, s4].forEach(s => { if (s) s.className = 'timeline-step'; });

    if (status === 'PENDING') {
      if (s1) s1.className = 'timeline-step active';
    } else if (status === 'PROCESSING') {
      if (s1) s1.className = 'timeline-step completed';
      if (s2) s2.className = 'timeline-step active';
    } else if (status === 'DISPATCHED') {
      if (s1) s1.className = 'timeline-step completed';
      if (s2) s2.className = 'timeline-step completed';
      if (s3) s3.className = 'timeline-step active';
    } else if (status === 'DELIVERED') {
      if (s1) s1.className = 'timeline-step completed';
      if (s2) s2.className = 'timeline-step completed';
      if (s3) s3.className = 'timeline-step completed';
      if (s4) s4.className = 'timeline-step completed';
    }
  }
};
