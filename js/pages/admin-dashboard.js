/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN DASHBOARD CONTROLLER (js/pages/admin-dashboard.js)
 * Manages KPI statistics, interactive Canvas revenue bar chart, recent order queues, and inventory alerts.
 */
const AdminDashboardPage = {
  init: async () => {
    // 1. Render Admin Sidebar
    AdminSidebarComponent.render('dashboard');

    // 2. Load KPIs and Tables
    await AdminDashboardPage.loadKPIs();
    await AdminDashboardPage.loadRecentOrders();
    await AdminDashboardPage.loadLowStock();
    AdminDashboardPage.renderSalesChart();
    AdminDashboardPage.attachListeners();
  },

  loadKPIs: async () => {
    try {
      const stats = await AdminService.getDashboardStats();
      if (document.getElementById('kpiRevenue')) {
        document.getElementById('kpiRevenue').textContent = `Rs. ${stats.totalRevenue.toLocaleString('en-US')}`;
      }
      if (document.getElementById('kpiOrders')) {
        document.getElementById('kpiOrders').textContent = stats.totalOrders;
      }
      if (document.getElementById('kpiProducts')) {
        document.getElementById('kpiProducts').textContent = stats.totalProducts;
      }
      if (document.getElementById('kpiLowStock')) {
        document.getElementById('kpiLowStock').textContent = stats.lowStockCount;
      }
    } catch (e) {
      console.error('[AdminDashboard] KPI load error:', e);
    }
  },

  loadRecentOrders: async () => {
    const tbody = document.getElementById('recentOrdersTableBody');
    if (!tbody) return;

    try {
      const orders = await OrderService.getMyOrders();
      let html = '';
      orders.slice(0, 5).forEach(order => {
        let badgeClass = 'badge-delivered';
        if (order.status === 'PENDING') badgeClass = 'badge-pending';
        else if (order.status === 'PROCESSING') badgeClass = 'badge-processing';
        else if (order.status === 'DISPATCHED') badgeClass = 'badge-dispatched';

        html += `
          <tr>
            <td><strong class="text-navy">${order.orderNumber || order.id}</strong></td>
            <td><div class="small fw-semibold">${order.customerName || 'Sarah Perera'}</div></td>
            <td><span class="fw-bold text-primary">Rs. ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
            <td><span class="badge-status ${badgeClass}">${order.status}</span></td>
            <td>
              <a href="orders.html" class="btn-action-icon" title="View in Order Management">
                <i class="bi bi-eye"></i>
              </a>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (e) {
      console.error('[AdminDashboard] Orders error:', e);
    }
  },

  loadLowStock: async () => {
    const tbody = document.getElementById('lowStockTableBody');
    if (!tbody) return;

    try {
      const inventory = await AdminService.getInventory();
      const lowStock = inventory.filter(i => i.stock <= i.reorderLevel);

      let html = '';
      lowStock.forEach(item => {
        html += `
          <tr>
            <td>
              <div class="small fw-bold text-navy">${item.name}</div>
              <small class="text-muted">SKU: ${item.sku}</small>
            </td>
            <td><span class="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold">${item.stock} units</span></td>
            <td><span class="small text-muted">${item.reorderLevel} units</span></td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (e) {
      console.error('[AdminDashboard] Inventory error:', e);
    }
  },

  /**
   * HTML5 Canvas Visual Bar & Line Chart
   */
  renderSalesChart: () => {
    const canvas = document.getElementById('salesAnalyticsCanvas');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const revenueValues = [140, 180, 210, 195, 250, 284.5]; // In thousands Rs.

    const padding = 40;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const barWidth = 45;
    const maxVal = 320;

    // Grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`Rs. ${(maxVal - (maxVal / 4) * i)}k`, 5, y + 3);
    }

    // Draw Bars
    const stepX = chartWidth / months.length;
    months.forEach((m, idx) => {
      const x = padding + stepX * idx + (stepX - barWidth) / 2;
      const val = revenueValues[idx];
      const barH = (val / maxVal) * chartHeight;
      const y = height - padding - barH;

      // Gradient fill
      const grad = ctx.createLinearGradient(x, y, x, height - padding);
      grad.addColorStop(0, '#0066B3');
      grad.addColorStop(1, '#2D9CDB');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]);
      ctx.fill();

      // Month Label
      ctx.fillStyle = '#475569';
      ctx.font = '11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m, x + barWidth / 2, height - padding + 18);

      // Value label on top
      ctx.fillStyle = '#003B66';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(`${val}k`, x + barWidth / 2, y - 6);
    });
  },

  attachListeners: () => {
    // Mobile Sidebar toggle
    const toggleBtn = document.getElementById('toggleSidebarBtn');
    const sidebar = document.getElementById('adminSidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
      });
    }
  }
};
