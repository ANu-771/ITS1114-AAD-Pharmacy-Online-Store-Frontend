/**
 * KK PHARMACY ONLINE PHARMACY - ORDER SERVICE (js/services/order-service.js)
 * Bridge for order placement, mock fallback dataset, status tracking, and invoice data formatting.
 */
const OrderService = {
  _mockOrders: [
    {
      id: 'ORD-89421',
      orderNumber: 'MED-2026-89421',
      date: '2026-08-25',
      customerName: 'Sarah Perera',
      customerEmail: 'user@example.com',
      shippingAddress: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
      paymentMethod: 'Credit Card (Visa)',
      status: 'DELIVERED',
      items: [
        { id: 2, name: 'Digital Blood Pressure Upper Arm Monitor', price: 14850.00, quantity: 1, image: 'assets/images/bp_monitor.png' },
        { id: 6, name: 'Paracetamol Extra Strength 500mg', price: 480.00, quantity: 2, image: 'assets/images/paracetamol.png' }
      ],
      subtotal: 15810.00,
      deliveryFee: 0.00,
      discount: 0.00,
      total: 15810.00,
      trackingId: 'MED-TRK-78912',
      estimatedDelivery: '2026-08-27'
    },
    {
      id: 'ORD-89422',
      orderNumber: 'MED-2026-89422',
      date: '2026-08-28',
      customerName: 'Sarah Perera',
      customerEmail: 'user@example.com',
      shippingAddress: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'PROCESSING',
      items: [
        { id: 1, name: 'Amoxicillin 500mg Antibiotic Capsules', price: 650.00, quantity: 2, image: 'assets/images/medicine_1.png' },
        { id: 3, name: 'Daily Multivitamin & Immunobooster 60s', price: 3200.00, quantity: 1, image: 'assets/images/vitamins_1.png' }
      ],
      subtotal: 4500.00,
      deliveryFee: 350.00,
      discount: 200.00,
      total: 4650.00,
      trackingId: 'MED-TRK-78945',
      estimatedDelivery: '2026-08-30'
    }
  ],

  /**
   * Get current user's orders
   */
  getMyOrders: async () => {
    if (CONFIG.USE_MOCK_DATA) {
      const stored = StorageService.getItem('medora_mock_orders') || OrderService._mockOrders;
      return stored;
    }
    try {
      return await OrderAPI.getMyOrders();
    } catch (e) {
      console.warn('[OrderService] Live API unavailable, falling back to mock orders.');
      return StorageService.getItem('medora_mock_orders') || OrderService._mockOrders;
    }
  },

  /**
   * Get single order by ID
   */
  getOrderById: async (orderId) => {
    const orders = await OrderService.getMyOrders();
    return orders.find(o => o.id === orderId || o.orderNumber === orderId) || null;
  },

  /**
   * Place a new order
   */
  placeOrder: async (orderData) => {
    if (CONFIG.USE_MOCK_DATA) {
      const orders = await OrderService.getMyOrders();
      const newId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      const newOrder = {
        id: newId,
        orderNumber: `MED-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toISOString().split('T')[0],
        customerName: orderData.customerName || 'Valued Customer',
        customerEmail: orderData.customerEmail || 'user@example.com',
        shippingAddress: `${orderData.address}, ${orderData.city}, ${orderData.postalCode}`,
        paymentMethod: orderData.paymentMethod || 'Credit Card',
        status: 'PENDING',
        items: orderData.items || [],
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        discount: orderData.discount || 0,
        total: orderData.total,
        trackingId: `MED-TRK-${Math.floor(10000 + Math.random() * 90000)}`,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      orders.unshift(newOrder);
      StorageService.setItem('medora_mock_orders', orders);
      CartService.clearCart();
      return newOrder;
    }

    try {
      const response = await OrderAPI.createOrder(orderData);
      CartService.clearCart();
      return response;
    } catch (e) {
      console.error('[OrderService] Place order error:', e);
      throw e;
    }
  }
};
