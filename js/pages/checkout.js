/**
 * KK PHARMACY ONLINE PHARMACY - CHECKOUT CONTROLLER (js/pages/checkout.js)
 * Manages customer information validation, prescription upload dropzone, payment method selection, and order placement.
 */
const CheckoutPage = {
  init: () => {
    const items = CartService.getCartItems();
    if (!items || items.length === 0) {
      Toast.show('Your cart is empty. Redirecting to catalog...', 'warning');
      setTimeout(() => { window.location.href = 'products.html'; }, 1200);
      return;
    }

    // Prefill customer profile if authenticated
    const user = AuthService.getCurrentUser();
    if (user) {
      if (document.getElementById('custFullName')) document.getElementById('custFullName').value = user.fullName || '';
      if (document.getElementById('custEmail')) document.getElementById('custEmail').value = user.email || '';
    }

    CheckoutPage.renderMiniSummary(items);
    CheckoutPage.attachListeners();
  },

  renderMiniSummary: (items) => {
    const miniContainer = document.getElementById('checkoutMiniItems');
    const countEl = document.getElementById('checkoutItemsCount');
    if (!miniContainer) return;

    if (countEl) countEl.textContent = items.length;

    let html = '';
    let subtotal = 0;

    items.forEach(item => {
      const lineTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1);
      subtotal += lineTotal;
      const imgSrc = resolveImagePath(item.image);
      const fallbackImg = resolveImagePath('assets/images/medicine_1.png');

      html += `
        <div class="d-flex align-items-center gap-3">
          <img src="${imgSrc}" alt="${item.name}" class="rounded-2 border p-1 bg-white" style="width: 46px; height: 46px; object-fit: contain;" onerror="this.onerror=null; this.src='${fallbackImg}';">
          <div class="flex-grow-1 overflow-hidden">
            <div class="small fw-semibold text-navy text-truncate">${item.name}</div>
            <div class="small text-muted">${item.quantity} × Rs. ${(parseFloat(item.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="small fw-bold text-navy text-nowrap">
            Rs. ${lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      `;
    });

    miniContainer.innerHTML = html;

    // Price Calculations
    const isFree = subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD;
    const delivery = isFree ? 0 : 350.00;
    const total = subtotal + delivery;

    if (document.getElementById('chkSubtotal')) {
      document.getElementById('chkSubtotal').textContent = `Rs. ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    const deliveryEl = document.getElementById('chkDelivery');
    if (deliveryEl) {
      if (isFree) {
        deliveryEl.textContent = 'FREE';
        deliveryEl.className = 'fw-semibold text-success';
      } else {
        deliveryEl.textContent = `Rs. ${delivery.toFixed(2)}`;
        deliveryEl.className = 'fw-semibold text-navy';
      }
    }
    if (document.getElementById('chkTotal')) {
      document.getElementById('chkTotal').textContent = `Rs. ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
  },

  attachListeners: () => {
    // Prescription dropzone file select
    const dropzone = document.getElementById('prescriptionDropzone');
    const fileInput = document.getElementById('prescriptionFileInput');
    const previewBox = document.getElementById('rxPreviewBox');
    const rxFileName = document.getElementById('rxFileName');
    const rxRemoveBtn = document.getElementById('rxRemoveBtn');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          rxFileName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
          previewBox.classList.remove('d-none');
          previewBox.classList.add('d-flex');
          dropzone.classList.add('d-none');
          Toast.show('Prescription document attached successfully!', 'success');
        }
      });
    }

    if (rxRemoveBtn && fileInput && dropzone && previewBox) {
      rxRemoveBtn.addEventListener('click', () => {
        fileInput.value = '';
        previewBox.classList.add('d-none');
        previewBox.classList.remove('d-flex');
        dropzone.classList.remove('d-none');
      });
    }

    // Form Submission
    const form = document.getElementById('checkoutForm');
    if (form && !form._hasSubmitHandler) {
      form._hasSubmitHandler = true;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
          e.stopPropagation();
          form.classList.add('was-validated');
          Toast.show('Please fill in all required delivery fields.', 'warning');
          return;
        }

        const items = CartService.getCartItems();
        if (!items || items.length === 0) {
          Toast.show('Your cart is empty. Please add items to proceed.', 'warning');
          return;
        }

        const subtotal = items.reduce((sum, i) => sum + ((parseFloat(i.price) || 0) * (parseInt(i.quantity, 10) || 1)), 0);
        const deliveryFee = subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : 350.00;
        const total = subtotal + deliveryFee;

        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Credit Card';

        const orderPayload = {
          customerName: document.getElementById('custFullName')?.value.trim() || 'Valued Patient',
          customerEmail: document.getElementById('custEmail')?.value.trim() || 'user@example.com',
          customerPhone: document.getElementById('custPhone')?.value.trim() || '+94 77 123 4567',
          city: document.getElementById('custCity')?.value || 'Colombo',
          address: document.getElementById('custAddress')?.value.trim() || 'Colombo, Sri Lanka',
          postalCode: document.getElementById('custZip')?.value.trim() || '',
          paymentMethod: paymentMethod,
          items: items,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: total
        };

        const submitBtn = document.getElementById('placeOrderBtn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing Healthcare Order...';
        }

        try {
          const createdOrder = await OrderService.placeOrder(orderPayload);
          Toast.show('Order placed successfully! Transferring to invoice...', 'success');
          
          setTimeout(() => {
            window.location.href = `order-details.html?id=${createdOrder.id || createdOrder.orderNumber}`;
          }, 800);
        } catch (err) {
          Toast.show(err.message || 'Failed to place order. Please try again.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-bag-check me-2"></i> Place & Confirm Order';
          }
        }
      });
    }
  }
};
