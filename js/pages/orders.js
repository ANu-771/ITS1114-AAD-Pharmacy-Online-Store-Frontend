/**
 * KK PHARMACY ONLINE PHARMACY - ORDERS PAGE CONTROLLER (js/pages/orders.js)
 * Manages customer order history listing, status indicators, and invoice view triggers.
 */
const OrdersPage = {
  init: async () => {
    const container = document.getElementById('userOrdersList');
    if (!container) return;

    try {
      const orders = await OrderService.getMyOrders();

      if (!orders || orders.length === 0) {
        container.innerHTML = `
          <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
            <i class="bi bi-box-seam display-3 text-muted opacity-50 mb-3"></i>
            <h4 class="fw-bold text-navy">No Orders Found</h4>
            <p class="text-muted small mb-4">You have not placed any healthcare or prescription orders yet.</p>
            <a href="products.html" class="btn btn-primary-pharmacy px-4 py-2 mx-auto" style="width: fit-content;">
              Browse Healthcare Products
            </a>
          </div>
        `;
        return;
      }

      let html = '';
      orders.forEach(order => {
        let statusBadge = '';
        if (order.status === 'DELIVERED') {
          statusBadge = '<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle-fill me-1"></i>Delivered</span>';
        } else if (order.status === 'PROCESSING') {
          statusBadge = '<span class="badge bg-primary-subtle text-primary border border-primary-subtle"><i class="bi bi-arrow-repeat me-1"></i>Processing</span>';
        } else if (order.status === 'DISPATCHED') {
          statusBadge = '<span class="badge bg-info-subtle text-info-emphasis border border-info-subtle"><i class="bi bi-truck me-1"></i>Dispatched</span>';
        } else {
          statusBadge = '<span class="badge bg-warning-subtle text-warning border border-warning-subtle"><i class="bi bi-hourglass-split me-1"></i>Pending</span>';
        }

        // Mini preview of items
        let itemsSummaryHtml = '';
        order.items.forEach(item => {
          const imgSrc = item.image.startsWith('../') ? item.image : `../${item.image}`;
          itemsSummaryHtml += `
            <div class="d-flex align-items-center gap-2 mb-2">
              <img src="${imgSrc}" alt="${item.name}" class="rounded border p-1" style="width: 36px; height: 36px; object-fit: contain; background:#FFF;">
              <span class="small text-navy text-truncate" style="max-width: 320px;">${item.name} <strong class="text-muted">(×${item.quantity})</strong></span>
            </div>
          `;
        });

        html += `
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div class="card-header bg-light py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 border-bottom">
              <div>
                <strong class="text-navy me-2">Order #${order.orderNumber || order.id}</strong>
                <span class="text-muted small">Placed on ${order.date || 'Recent'}</span>
              </div>
              <div class="d-flex align-items-center gap-3">
                ${statusBadge}
                <strong class="text-primary fs-6">Rs. ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
            <div class="card-body p-4">
              <div class="row align-items-center g-3">
                <div class="col-12 col-md-7">
                  ${itemsSummaryHtml}
                </div>
                <div class="col-12 col-md-5 text-md-end">
                  <div class="small text-muted mb-2">
                    <i class="bi bi-geo-alt me-1"></i> Delivered to: <span class="text-navy fw-medium">${order.shippingAddress || 'Colombo'}</span>
                  </div>
                  <a href="order-details.html?id=${order.id || order.orderNumber}" class="btn btn-outline-pharmacy btn-sm px-3 py-1">
                    <i class="bi bi-file-text me-1"></i> View Invoice & Tracking
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    } catch (e) {
      console.error('[OrdersPage] Error:', e);
    }
  }
};
