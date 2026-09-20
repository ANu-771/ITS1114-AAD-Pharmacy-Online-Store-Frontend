/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN SERVICE (js/services/admin-service.js)
 * Business logic and Spring Boot REST API integration for Admin Management Portal.
 */
const AdminService = {
  _mockInventory: [
    { id: 1, name: 'Amoxicillin 500mg Capsules', sku: 'RX-AMX-500', category: 'Medicines', stock: 45, reorderLevel: 20, batch: 'AMX23G01', expiry: '2026-09-30', status: 'IN_STOCK' },
    { id: 2, name: 'Digital BP Upper Arm Monitor', sku: 'EQ-OMR-BP01', category: 'Medical Equipment', stock: 8, reorderLevel: 10, batch: 'OMR24-11', expiry: 'N/A (Device)', status: 'LOW_STOCK' },
    { id: 3, name: 'Daily Multivitamin & Minerals 60s', sku: 'VT-7S-60', category: 'Vitamins', stock: 62, reorderLevel: 15, batch: 'VT99B4', expiry: '2027-04-15', status: 'IN_STOCK' },
    { id: 4, name: 'Fingertip Pulse Oximeter OLED', sku: 'EQ-OXI-02', category: 'Medical Equipment', stock: 4, reorderLevel: 8, batch: 'OX24-05', expiry: 'N/A (Device)', status: 'LOW_STOCK' },
    { id: 5, name: 'Accu-Chek Glucose Meter Kit', sku: 'EQ-GLU-01', category: 'Medical Equipment', stock: 18, reorderLevel: 10, batch: 'GLU24-88', expiry: '2027-01-20', status: 'IN_STOCK' },
    { id: 6, name: 'Paracetamol Extra Strength 500mg', sku: 'OTC-PCM-100', category: 'Medicines', stock: 120, reorderLevel: 30, batch: 'PCM23A04', expiry: '2026-09-15', status: 'IN_STOCK' },
    { id: 7, name: 'Ultrasonic Compressor Nebulizer', sku: 'EQ-NEB-09', category: 'Medical Equipment', stock: 3, reorderLevel: 5, batch: 'NEB24-01', expiry: 'N/A (Device)', status: 'LOW_STOCK' },
    { id: 8, name: 'Infrared Forehead Thermometer', sku: 'EQ-THM-03', category: 'Medical Equipment', stock: 24, reorderLevel: 10, batch: 'THM24-77', expiry: 'N/A (Device)', status: 'IN_STOCK' }
  ],

  _mockUsers: [
    { id: 101, fullName: 'System Administrator', email: 'admin@medora.com', phone: '+94 11 234 5678', role: 'ROLE_ADMIN', roles: ['ROLE_ADMIN'], status: 'ACTIVE', enabled: true, joinDate: '2025-01-10' },
    { id: 102, fullName: 'Sarah Perera', email: 'user@example.com', phone: '+94 77 123 4567', role: 'ROLE_USER', roles: ['ROLE_USER'], status: 'ACTIVE', enabled: true, joinDate: '2026-02-14' },
    { id: 103, fullName: 'Dr. Ruwan Silva', email: 'ruwan.s@hospital.lk', phone: '+94 71 987 6543', role: 'ROLE_USER', roles: ['ROLE_USER'], status: 'ACTIVE', enabled: true, joinDate: '2026-03-01' },
    { id: 104, fullName: 'Kamal Jayawardena', email: 'kamal.j@gmail.com', phone: '+94 76 555 8899', role: 'ROLE_USER', roles: ['ROLE_USER'], status: 'ACTIVE', enabled: true, joinDate: '2026-05-19' },
    { id: 105, fullName: 'Nimali Fonseka', email: 'nimali.f@yahoo.com', phone: '+94 72 444 1122', role: 'ROLE_USER', roles: ['ROLE_USER'], status: 'DISABLED', enabled: false, joinDate: '2026-06-22' }
  ],

  /**
   * Get Dashboard Overview KPI Stats
   */
  getDashboardStats: async () => {
    if (CONFIG.USE_MOCK_DATA) {
      return {
        totalRevenue: 284500.00,
        revenueChange: '+14.8%',
        totalOrders: 64,
        ordersChange: '+8.2%',
        totalProducts: 48,
        lowStockCount: 3,
        totalUsers: 142
      };
    }
    try {
      const stats = await AdminAPI.getDashboardStats();
      return {
        totalRevenue: parseFloat(stats.totalRevenue) || 0,
        revenueChange: stats.revenueChange || '+12.5%',
        totalOrders: stats.totalOrders || 0,
        ordersChange: stats.ordersChange || '+5.0%',
        totalProducts: stats.totalProducts || 0,
        lowStockCount: stats.lowStockCount || stats.lowStockProducts || 0,
        totalUsers: stats.totalUsers || stats.totalCustomers || 0,
        categoryDistribution: stats.categoryDistribution || {},
        monthlyRevenue: stats.monthlyRevenue || {},
        recentOrders: Array.isArray(stats.recentOrders) ? stats.recentOrders : []
      };
    } catch (e) {
      console.warn('[AdminService] Live dashboard stats failed, using fallback:', e.message);
      return {
        totalRevenue: 284500.00,
        revenueChange: '+14.8%',
        totalOrders: 64,
        ordersChange: '+8.2%',
        totalProducts: 48,
        lowStockCount: 3,
        totalUsers: 142
      };
    }
  },

  /**
   * Get Inventory List
   */
  getInventory: async () => {
    if (CONFIG.USE_MOCK_DATA) {
      return StorageService.getItem('kk_admin_inventory') || AdminService._mockInventory;
    }
    try {
      const liveInventory = await AdminAPI.getInventory();
      if (Array.isArray(liveInventory) && liveInventory.length > 0) {
        return liveInventory.map(i => ({
          id: i.productId || i.id,
          productId: i.productId || i.id,
          name: i.productName || i.name || 'Healthcare Product',
          sku: i.sku || `MED-SKU-${i.productId || i.id}`,
          category: i.category || 'Medicines',
          stock: i.currentStock !== undefined ? i.currentStock : (i.stock !== undefined ? i.stock : 0),
          reorderLevel: i.reorderLevel || 10,
          batch: i.latestBatchNumber || i.batch || 'BAT-2026',
          expiry: i.earliestExpiryDate || i.expiry || '2027-12-31',
          status: (i.currentStock <= (i.reorderLevel || 10)) ? 'LOW_STOCK' : 'IN_STOCK'
        }));
      }
      return StorageService.getItem('kk_admin_inventory') || AdminService._mockInventory;
    } catch (e) {
      console.warn('[AdminService] Live inventory failed, using fallback:', e.message);
      return StorageService.getItem('kk_admin_inventory') || AdminService._mockInventory;
    }
  },

  /**
   * Add Inward Inventory Batch
   */
  addBatch: async (batchData) => {
    const payload = {
      productId: Number(batchData.productId || batchData.id),
      batchNumber: batchData.batchNumber || batchData.batch,
      quantity: Number(batchData.quantity || batchData.qty),
      expiryDate: batchData.expiryDate || batchData.expiry,
      manufacturer: batchData.manufacturer || 'Certified Pharma Lab'
    };

    if (CONFIG.USE_MOCK_DATA) {
      const inventory = await AdminService.getInventory();
      const item = inventory.find(i => i.id === payload.productId);
      if (item) {
        item.stock += payload.quantity;
        item.batch = payload.batchNumber;
        item.expiry = payload.expiryDate;
        StorageService.setItem('kk_admin_inventory', inventory);
      }
      return payload;
    }

    try {
      return await AdminAPI.addBatch(payload);
    } catch (e) {
      console.error('[AdminService] Live addBatch error:', e);
      throw e;
    }
  },

  /**
   * Get User Accounts List
   */
  getUsers: async () => {
    if (CONFIG.USE_MOCK_DATA) {
      return StorageService.getItem('kk_admin_users') || AdminService._mockUsers;
    }
    try {
      const liveUsers = await AdminAPI.getUsers();
      if (Array.isArray(liveUsers) && liveUsers.length > 0) {
        return liveUsers.map(u => ({
          id: u.id,
          fullName: u.fullName || 'User',
          email: u.email,
          phone: u.phone || '+94 77 000 0000',
          role: (u.roles && u.roles.includes('ROLE_ADMIN')) ? 'ROLE_ADMIN' : 'ROLE_USER',
          roles: u.roles || ['ROLE_USER'],
          status: u.enabled ? 'ACTIVE' : 'DISABLED',
          enabled: !!u.enabled,
          joinDate: u.createdAt ? String(u.createdAt).split('T')[0] : '2026-01-01'
        }));
      }
      return StorageService.getItem('kk_admin_users') || AdminService._mockUsers;
    } catch (e) {
      console.warn('[AdminService] Live users failed, using fallback:', e.message);
      return StorageService.getItem('kk_admin_users') || AdminService._mockUsers;
    }
  },

  /**
   * Toggle User Account Status
   */
  toggleUserStatus: async (userId) => {
    const users = await AdminService.getUsers();
    const user = users.find(u => u.id === Number(userId));
    if (!user) throw new Error('User not found');

    const newEnabled = user.status !== 'ACTIVE';

    if (!CONFIG.USE_MOCK_DATA) {
      try {
        const updated = await AdminAPI.updateUserStatus(userId, newEnabled);
        return {
          id: updated.id,
          fullName: updated.fullName,
          status: updated.enabled ? 'ACTIVE' : 'DISABLED',
          enabled: updated.enabled
        };
      } catch (e) {
        console.warn('[AdminService] Live toggleUserStatus error:', e);
      }
    }

    user.status = newEnabled ? 'ACTIVE' : 'DISABLED';
    user.enabled = newEnabled;
    StorageService.setItem('kk_admin_users', users);
    return user;
  },

  /**
   * Update Order Status
   */
  updateOrderStatus: async (orderId, newStatus, trackingId = null) => {
    if (!CONFIG.USE_MOCK_DATA) {
      try {
        return await OrderAPI.updateOrderStatus(orderId, newStatus, trackingId);
      } catch (e) {
        console.warn('[AdminService] Live updateOrderStatus failed, updating local state:', e.message);
      }
    }

    const orders = await OrderService.getMyOrders();
    const order = orders.find(o => String(o.id) === String(orderId) || o.orderNumber === String(orderId));
    if (order) {
      order.status = newStatus;
      if (trackingId) order.trackingId = trackingId;
      StorageService.setItem('kk_mock_orders', orders);
      return order;
    }
    return { id: orderId, status: newStatus };
  }
};
