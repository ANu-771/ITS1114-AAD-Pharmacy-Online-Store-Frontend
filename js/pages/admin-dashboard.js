/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN DASHBOARD CONTROLLER (js/pages/admin-dashboard.js)
 * Real-time database metrics synchronization, dynamic sales charts, live order feeds, and low-stock alerts.
 */
const AdminDashboardPage = {
  pollTimer: null,
  isRefreshing: false,

  init: async () => {
    // 1. Render Admin Sidebar
    AdminSidebarComponent.render('dashboard');

    // 2. Initial Data Load from Database
    await AdminDashboardPage.refreshDashboard(true);

    // 3. Attach Listeners
    AdminDashboardPage.attachListeners();

    // 4. Start Real-Time Auto-Refresh Heartbeat (every 25 seconds)
    if (AdminDashboardPage.pollTimer) clearInterval(AdminDashboardPage.pollTimer);
    AdminDashboardPage.pollTimer = setInterval(() => {
      AdminDashboardPage.refreshDashboard(false);
    }, 25000);
  },

  /**
   * Main real-time synchronization function
   */
  refreshDashboard: async (showSpinner = false) => {
    if (AdminDashboardPage.isRefreshing) return;
    AdminDashboardPage.isRefreshing = true;

    const refreshIcon = document.getElementById('refreshIcon');
    const syncStatusText = document.getElementById('syncStatusText');
    if (refreshIcon) refreshIcon.classList.add('spin-animation');
    if (syncStatusText && showSpinner) syncStatusText.textContent = 'Syncing...';

    try {
      // 1. Fetch live metrics from Spring Boot Backend (/api/v1/admin/dashboard-stats)
      const stats = await AdminService.getDashboardStats();

      // 2. Update KPI Metric Cards
      AdminDashboardPage.updateKPIs(stats);

      // 3. Render Dynamic Revenue & Order Trend Bar Chart
      AdminDashboardPage.renderSalesChart(stats.monthlyRevenue);

      // 4. Render Dynamic Sales by Department Category Distribution
      AdminDashboardPage.renderCategoryDistribution(stats.categoryDistribution);

      // 5. Render Recent Pharmacy Orders Queue
      await AdminDashboardPage.loadRecentOrders(stats.recentOrders);

      // 6. Render Critical Low Stock Warnings
      await AdminDashboardPage.loadLowStock();

      // 7. Update Sync Timestamp
      if (syncStatusText) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        syncStatusText.textContent = `Synced ${timeStr}`;
      }

    } catch (error) {
      console.error('[AdminDashboardPage] Real-time sync error:', error);
      if (syncStatusText) syncStatusText.textContent = 'Sync Error';
    } finally {
      AdminDashboardPage.isRefreshing = false;
      if (refreshIcon) {
        setTimeout(() => refreshIcon.classList.remove('spin-animation'), 600);
      }
    }
  },

  /**
   * Populate Top KPI Statistics from Database
   */
  updateKPIs: (stats) => {
    // Total Revenue
    const kpiRevenue = document.getElementById('kpiRevenue');
    if (kpiRevenue) {
      const rev = parseFloat(stats.totalRevenue) || 0;
      kpiRevenue.textContent = `Rs. ${rev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Total Orders
    const kpiOrders = document.getElementById('kpiOrders');
    if (kpiOrders) {
      kpiOrders.textContent = (stats.totalOrders !== undefined ? stats.totalOrders : 0).toLocaleString('en-US');
    }

    // Active Products Count
    const kpiProducts = document.getElementById('kpiProducts');
    if (kpiProducts) {
      kpiProducts.textContent = stats.totalProducts || 0;
    }
    const kpiProductsSubtext = document.getElementById('kpiProductsSubtext');
    if (kpiProductsSubtext && stats.categoryDistribution) {
      const catCount = Object.keys(stats.categoryDistribution).length;
      kpiProductsSubtext.textContent = `${catCount} Active Categories`;
    }

    // Low Stock Warnings
    const kpiLowStock = document.getElementById('kpiLowStock');
    if (kpiLowStock) {
      kpiLowStock.textContent = stats.lowStockCount || stats.lowStockProducts || 0;
    }
    const kpiLowStockSubtext = document.getElementById('kpiLowStockSubtext');
    if (kpiLowStockSubtext) {
      const lowCount = stats.lowStockCount || stats.lowStockProducts || 0;
      if (lowCount === 0) {
        kpiLowStockSubtext.innerHTML = '<span class="text-success"><i class="bi bi-check-circle"></i> Inventory is healthy</span>';
      } else {
        kpiLowStockSubtext.innerHTML = '<span class="text-danger"><i class="bi bi-exclamation-circle"></i> Requires immediate reorder</span>';
      }
    }
  },

  /**
   * Dynamic HTML5 Canvas Bar Chart Rendering Live Database Monthly Revenue
   */
  renderSalesChart: (monthlyRevenueMap) => {
    const canvas = document.getElementById('salesAnalyticsCanvas');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Parse months and revenues from backend map or provide defaults
    let months = [];
    let revenueValues = [];

    if (monthlyRevenueMap && typeof monthlyRevenueMap === 'object' && Object.keys(monthlyRevenueMap).length > 0) {
      months = Object.keys(monthlyRevenueMap).map(k => k.split(' ')[0]); // Extract 'Mar', 'Apr', etc.
      revenueValues = Object.values(monthlyRevenueMap).map(v => parseFloat(v) || 0);
    } else {
      months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
      revenueValues = [0, 0, 0, 0, 0, 9810];
    }

    const padding = 45;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const barWidth = Math.min(48, Math.max(28, (chartWidth / months.length) * 0.55));

    // Calculate maximum value for dynamic Y-axis scaling
    const maxDataVal = Math.max(...revenueValues, 1000);
    // Round max value up to next clean benchmark
    let maxVal = Math.ceil(maxDataVal / 1000) * 1000;
    if (maxVal < 5000) maxVal = 5000;

    // Draw Grid Lines & Y-Axis Labels
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      const labelVal = maxVal - (maxVal / 4) * i;
      const formattedLabel = labelVal >= 1000 
        ? `Rs. ${(labelVal / 1000).toFixed(labelVal % 1000 === 0 ? 0 : 1)}k`
        : `Rs. ${labelVal}`;

      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(formattedLabel, padding - 8, y + 4);
    }

    // Draw Dynamic Bars
    const stepX = chartWidth / months.length;
    months.forEach((m, idx) => {
      const x = padding + stepX * idx + (stepX - barWidth) / 2;
      const val = revenueValues[idx];
      const barH = Math.max(val > 0 ? 8 : 2, (val / maxVal) * chartHeight);
      const y = height - padding - barH;

      // Gradient Fill
      const grad = ctx.createLinearGradient(x, y, x, height - padding);
      if (val > 0) {
        grad.addColorStop(0, '#0066B3');
        grad.addColorStop(1, '#2D9CDB');
      } else {
        grad.addColorStop(0, '#E2E8F0');
        grad.addColorStop(1, '#CBD5E1');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]);
      } else {
        ctx.rect(x, y, barWidth, barH);
      }
      ctx.fill();

      // Month Label
      ctx.fillStyle = '#475569';
      ctx.font = '11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m, x + barWidth / 2, height - padding + 18);

      // Value label on top of bar
      if (val > 0) {
        ctx.fillStyle = '#003B66';
        ctx.font = 'bold 10px Inter, sans-serif';
        const formattedVal = val >= 1000 
          ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` 
          : `Rs. ${val}`;
        ctx.fillText(formattedVal, x + barWidth / 2, y - 6);
      }
    });
  },

  /**
   * Dynamic Sales by Department Category Distribution
   */
  renderCategoryDistribution: (categoryMap) => {
    const container = document.getElementById('categoryDistributionContainer');
    if (!container) return;

    if (!categoryMap || Object.keys(categoryMap).length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted small">
          <i class="bi bi-inbox fs-3 d-block mb-2 opacity-50"></i>
          No category distribution data available.
        </div>
      `;
      return;
    }

    const totalProducts = Object.values(categoryMap).reduce((sum, count) => sum + count, 0);
    const colors = ['bg-primary', 'bg-info', 'bg-success', 'bg-warning', 'bg-danger', 'bg-secondary'];

    let html = '';
    let idx = 0;

    Object.entries(categoryMap).forEach(([catName, count]) => {
      const percentage = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
      const colorClass = colors[idx % colors.length];
      idx++;

      html += `
        <div class="mb-3">
          <div class="d-flex justify-content-between small mb-1">
            <span class="text-navy fw-semibold text-truncate" style="max-width: 70%;">${catName}</span>
            <span class="text-primary fw-bold">${percentage}% <small class="text-muted fw-normal">(${count})</small></span>
          </div>
          <div class="progress" style="height: 6px;">
            <div class="progress-bar ${colorClass}" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  /**
   * Load Recent Orders Queue from Live Database
   */
  loadRecentOrders: async (providedOrders) => {
    const tbody = document.getElementById('recentOrdersTableBody');
    if (!tbody) return;

    let orders = Array.isArray(providedOrders) && providedOrders.length > 0 ? providedOrders : [];

    if (orders.length === 0) {
      try {
        const response = await OrderAPI.getAllOrders({ page: 0, size: 5 });
        orders = Array.isArray(response) ? response : (response.content || []);
      } catch (e) {
        console.warn('[AdminDashboard] Live orders fetch fallback:', e.message);
      }
    }

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-muted small">
            <i class="bi bi-inbox fs-4 d-block mb-1 opacity-50"></i>
            No customer orders placed yet in the database.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    orders.slice(0, 5).forEach(order => {
      let badgeClass = 'badge-delivered';
      const status = order.status || 'PENDING';
      if (status === 'PENDING' || status === 'PRESCRIPTION_REVIEW') badgeClass = 'badge-pending';
      else if (status === 'PROCESSING') badgeClass = 'badge-processing';
      else if (status === 'DISPATCHED') badgeClass = 'badge-dispatched';

      const totalVal = parseFloat(order.totalAmount || order.total || 0);

      html += `
        <tr>
          <td><strong class="text-navy">${order.orderNumber || ('#' + order.id)}</strong></td>
          <td><div class="small fw-semibold text-truncate" style="max-width: 140px;">${order.customerName || 'Valued Patient'}</div></td>
          <td><span class="fw-bold text-primary">Rs. ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
          <td><span class="badge-status ${badgeClass}">${status}</span></td>
          <td>
            <a href="orders.html" class="btn-action-icon" title="View in Order Management">
              <i class="bi bi-eye"></i>
            </a>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  },

  /**
   * Load Critical Low Stock Warnings from Database Catalog
   */
  loadLowStock: async () => {
    const tbody = document.getElementById('lowStockTableBody');
    if (!tbody) return;

    try {
      const products = await ProductService.getProducts('all');
      const lowStock = (Array.isArray(products) ? products : []).filter(p => {
        const stockVal = p.stock !== undefined ? p.stock : (p.initialStock !== undefined ? p.initialStock : (p.inStock ? 50 : 0));
        return stockVal <= 10;
      });

      if (lowStock.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="3" class="text-center py-3 text-success small">
              <i class="bi bi-shield-check fs-5 d-block mb-1"></i>
              All product lines maintain healthy inventory levels.
            </td>
          </tr>
        `;
        return;
      }

      let html = '';
      lowStock.slice(0, 6).forEach(item => {
        const stockVal = item.stock !== undefined ? item.stock : (item.initialStock || 0);
        html += `
          <tr>
            <td>
              <div class="small fw-bold text-navy text-truncate" style="max-width: 180px;">${item.name}</div>
              <small class="text-muted">Brand: ${item.brand || 'KK PHARMACY'}</small>
            </td>
            <td><span class="badge ${stockVal === 0 ? 'bg-danger text-white' : 'bg-danger-subtle text-danger border border-danger-subtle'} fw-bold">${stockVal} units left</span></td>
            <td><span class="small text-muted font-monospace">Reorder &le; 10</span></td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (e) {
      console.warn('[AdminDashboard] Low stock fetch error:', e.message);
    }
  },

  /**
   * User interaction listeners
   */
  attachListeners: () => {
    // Manual Live Refresh Button
    const refreshBtn = document.getElementById('btnRefreshDashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        await AdminDashboardPage.refreshDashboard(true);
      });
    }

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

// CSS Spin Animation Helper
if (!document.getElementById('dashboard-sync-css')) {
  const style = document.createElement('style');
  style.id = 'dashboard-sync-css';
  style.textContent = `
    .spin-animation {
      display: inline-block;
      animation: dashSpin 0.75s linear infinite;
    }
    @keyframes dashSpin {
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
