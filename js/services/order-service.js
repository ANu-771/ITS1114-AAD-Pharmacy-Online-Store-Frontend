/**
 * KK PHARMACY ONLINE PHARMACY - ORDER SERVICE (js/services/order-service.js)
 * Manages order creation, customer order history, invoice retrieval, and mock fallback dataset.
 */
const OrderService = {
  _mockOrders: [
    {
      id: 1,
      orderNumber: 'MED-2026-89421',
      date: '2026-08-25',
      customerName: 'Sarah Perera',
      customerEmail: 'user@example.com',
      shippingAddress: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
      paymentMethod: 'Credit Card (Visa)',
      paymentStatus: 'PAID',
      status: 'DELIVERED',
      items: [
        { id: 1, productId: 2, name: 'Digital Blood Pressure Upper Arm Monitor', price: 14850.00, quantity: 1, image: 'assets/images/bp_monitor.png' },
        { id: 2, productId: 6, name: 'Paracetamol Extra Strength 500mg', price: 480.00, quantity: 2, image: 'assets/images/paracetamol.png' }
      ],
      subtotal: 15810.00,
      deliveryFee: 0.00,
      discount: 0.00,
      total: 15810.00,
      trackingId: 'MED-TRK-78912',
      estimatedDelivery: '2026-08-27'
    },
    {
      id: 2,
      orderNumber: 'MED-2026-89422',
      date: '2026-08-28',
      customerName: 'Sarah Perera',
      customerEmail: 'user@example.com',
      shippingAddress: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'PENDING',
      status: 'PROCESSING',
      items: [
        { id: 3, productId: 1, name: 'Amoxicillin 500mg Antibiotic Capsules', price: 650.00, quantity: 2, image: 'assets/images/medicine_1.png' },
        { id: 4, productId: 3, name: 'Daily Multivitamin & Immunobooster 60s', price: 3200.00, quantity: 1, image: 'assets/images/vitamins_1.png' }
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
   * Helper to normalize order DTO
   */
  _normalizeOrder: (o) => {
    if (!o) return null;
    return {
      id: o.id,
      orderNumber: o.orderNumber || `MED-2026-${o.id}`,
      date: o.date || (o.createdAt ? String(o.createdAt).split('T')[0] : new Date().toISOString().split('T')[0]),
      customerName: o.customerName || 'Valued Patient',
      customerEmail: o.customerEmail || 'user@example.com',
      shippingAddress: o.shippingAddress || 'Colombo, Sri Lanka',
      paymentMethod: o.paymentMethod || 'Credit Card',
      paymentStatus: o.paymentStatus || 'COMPLETED',
      status: o.status || 'PENDING',
      items: Array.isArray(o.items) ? o.items.map(i => ({
        id: i.id || i.productId,
        productId: i.productId || i.id,
        name: i.name || i.productName || 'Healthcare Product',
        price: parseFloat(i.price) || 0,
        quantity: parseInt(i.quantity, 10) || 1,
        image: i.image ? i.image.replace(/^(\.\.\/)+/, '') : 'assets/images/medicine_1.png'
      })) : [],
      subtotal: parseFloat(o.subtotal) || 0,
      deliveryFee: parseFloat(o.deliveryFee) || 0,
      discount: parseFloat(o.discount) || 0,
      total: parseFloat(o.total || o.totalAmount) || 0,
      trackingId: o.trackingId || `MED-TRK-${o.id || 'PENDING'}`,
      estimatedDelivery: o.estimatedDelivery ? String(o.estimatedDelivery) : 'In 2 business days',
      prescriptionId: o.prescriptionId || null,
      prescriptionStatus: o.prescriptionStatus || null
    };
  },

  /**
   * Get current user's orders
   */
  getMyOrders: async () => {
    if (CONFIG.USE_MOCK_DATA) {
      const stored = StorageService.getItem('kk_mock_orders') || OrderService._mockOrders;
      return stored.map(OrderService._normalizeOrder);
    }
    try {
      const liveOrders = await OrderAPI.getMyOrders();
      if (Array.isArray(liveOrders)) {
        return liveOrders.map(OrderService._normalizeOrder);
      }
      return [];
    } catch (e) {
      console.warn('[OrderService] Live API unavailable, falling back to mock orders:', e.message);
      const stored = StorageService.getItem('kk_mock_orders') || OrderService._mockOrders;
      return stored.map(OrderService._normalizeOrder);
    }
  },

  /**
   * Get single order by ID
   */
  getOrderById: async (orderId) => {
    if (CONFIG.USE_MOCK_DATA) {
      const orders = await OrderService.getMyOrders();
      return orders.find(o => String(o.id) === String(orderId) || o.orderNumber === String(orderId)) || orders[0] || null;
    }
    try {
      const order = await OrderAPI.getOrderById(orderId);
      if (order && order.id) {
        return OrderService._normalizeOrder(order);
      }
    } catch (e) {
      console.warn('[OrderService] Live getOrderById failed, checking cache:', e.message);
    }
    const orders = await OrderService.getMyOrders();
    return orders.find(o => String(o.id) === String(orderId) || o.orderNumber === String(orderId)) || null;
  },

  /**
   * Place a new order
   */
  placeOrder: async (orderData) => {
    // Format OrderCreateRequest DTO payload
    const formattedItems = (orderData.items || []).map(i => ({
      productId: Number(i.productId || i.id),
      quantity: Number(i.quantity || 1),
      price: Number(i.price || 0),
      name: i.name || 'Healthcare Product',
      image: i.image ? i.image.replace(/^(\.\.\/)+/, '') : 'assets/images/medicine_1.png'
    }));

    const payload = {
      customerName: orderData.customerName || 'Valued Patient',
      customerEmail: orderData.customerEmail || 'user@example.com',
      phone: orderData.phone || orderData.customerPhone || '+94 77 123 4567',
      address: orderData.address || 'Colombo, Sri Lanka',
      addressLine1: orderData.address || '',
      city: orderData.city || 'Colombo',
      postalCode: orderData.postalCode || '',
      shippingAddress: `${orderData.address || ''}, ${orderData.city || ''}, ${orderData.postalCode || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, ''),
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      items: formattedItems,
      subtotal: parseFloat(orderData.subtotal) || 0,
      deliveryFee: parseFloat(orderData.deliveryFee) || 0,
      discount: parseFloat(orderData.discount) || 0,
      total: parseFloat(orderData.total) || 0,
      totalAmount: parseFloat(orderData.total) || 0,
      prescriptionId: orderData.prescriptionId ? Number(orderData.prescriptionId) : null,
      doctorName: orderData.doctorName || null,
      prescriptionUrl: orderData.prescriptionUrl || null
    };

    if (CONFIG.USE_MOCK_DATA) {
      const orders = await OrderService.getMyOrders();
      const newId = Math.floor(10000 + Math.random() * 90000);
      const newOrder = {
        id: newId,
        orderNumber: `MED-2026-${newId}`,
        date: new Date().toISOString().split('T')[0],
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        shippingAddress: payload.shippingAddress,
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'PAID',
        status: 'PENDING',
        items: payload.items,
        subtotal: payload.subtotal,
        deliveryFee: payload.deliveryFee,
        discount: payload.discount,
        total: payload.total,
        trackingId: `MED-TRK-${newId}`,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      orders.unshift(newOrder);
      StorageService.setItem('kk_mock_orders', orders);
      await CartService.clearCart();
      return newOrder;
    }

    try {
      const response = await OrderAPI.createOrder(payload);
      await CartService.clearCart();
      return OrderService._normalizeOrder(response);
    } catch (e) {
      console.error('[OrderService] Live placeOrder error:', e);
      throw e;
    }
  }
};
