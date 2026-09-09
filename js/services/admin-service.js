/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN SERVICE (js/services/admin-service.js)
 * Business logic and mock state management for the Admin Management Portal.
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
    { id: 101, fullName: 'System Administrator', email: 'admin@medora.com', phone: '+94 11 234 5678', role: 'ROLE_ADMIN', status: 'ACTIVE', joinDate: '2025-01-10' },
    { id: 102, fullName: 'Sarah Perera', email: 'user@example.com', phone: '+94 77 123 4567', role: 'ROLE_USER', status: 'ACTIVE', joinDate: '2026-02-14' },
    { id: 103, fullName: 'Dr. Ruwan Silva', email: 'ruwan.s@hospital.lk', phone: '+94 71 987 6543', role: 'ROLE_USER', status: 'ACTIVE', joinDate: '2026-03-01' },
    { id: 104, fullName: 'Kamal Jayawardena', email: 'kamal.j@gmail.com', phone: '+94 76 555 8899', role: 'ROLE_USER', status: 'ACTIVE', joinDate: '2026-05-19' },
    { id: 105, fullName: 'Nimali Fonseka', email: 'nimali.f@yahoo.com', phone: '+94 72 444 1122', role: 'ROLE_USER', status: 'DISABLED', joinDate: '2026-06-22' }
  ],

  /**
   * Get Dashboard Overview Stats
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
    return await AdminAPI.getDashboardStats();
  },

  /**
   * Get Inventory List
   */
  getInventory: async () => {
    if (CONFIG.USE_MOCK_DATA) {
      const stored = StorageService.getItem('medora_admin_inventory') || AdminService._mockInventory;
      return stored;
    }
    return await AdminAPI.getInventory();
  },

  /**
   * Get User Accounts List
   */
  getUsers: async () => {
    if (CONFIG.USE_MOCK_DATA) {
      const stored = StorageService.getItem('medora_admin_users') || AdminService._mockUsers;
      return stored;
    }
    return await AdminAPI.getUsers();
  },

  /**
   * Toggle User Account Status
   */
  toggleUserStatus: async (userId) => {
    const users = await AdminService.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      StorageService.setItem('medora_admin_users', users);
      return user;
    }
    throw new Error('User not found');
  },

  /**
   * Update Order Status
   */
  updateOrderStatus: async (orderId, newStatus) => {
    const orders = await OrderService.getMyOrders();
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      order.status = newStatus;
      StorageService.setItem('medora_mock_orders', orders);
      return order;
    }
    throw new Error('Order not found');
  }
};
