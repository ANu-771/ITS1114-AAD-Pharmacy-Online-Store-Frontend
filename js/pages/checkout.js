/**
 * KK PHARMACY ONLINE PHARMACY - CHECKOUT CONTROLLER (js/pages/checkout.js)
 * Manages customer information validation, guest authentication prompt banner & modal,
 * prescription upload dropzone, payment method selection, and order placement.
 */
const CheckoutPage = {
  guestConfirmed: false,

  init: () => {
    const items = CartService.getCartItems();
    if (!items || items.length === 0) {
      Toast.show('Your cart is empty. Redirecting to catalog...', 'warning');
      setTimeout(() => { window.location.href = 'products.html'; }, 1200);
      return;
    }

    CheckoutPage.updateAuthUI();
    CheckoutPage.renderMiniSummary(items);
    CheckoutPage.attachListeners();

    // Listen to global auth state changes (e.g. user logs in from banner or modal)
    window.addEventListener('auth:state-changed', () => {
      CheckoutPage.updateAuthUI();
      const updatedItems = CartService.getCartItems();
      CheckoutPage.renderMiniSummary(updatedItems);
    });
  },

  /**
   * Update banner and customer fields based on current authentication state
   */
  updateAuthUI: () => {
    const banner = document.getElementById('guestCheckoutBanner');
    const user = AuthService.getCurrentUser();
    const isAuth = AuthService.isAuthenticated();

    if (isAuth && user) {
      if (banner) banner.classList.add('d-none');
      if (document.getElementById('custFullName')) {
        document.getElementById('custFullName').value = user.fullName || '';
      }
      if (document.getElementById('custEmail')) {
        document.getElementById('custEmail').value = user.email || '';
      }
      if (document.getElementById('custPhone') && user.phone) {
        document.getElementById('custPhone').value = user.phone;
      }
    } else {
      if (banner) banner.classList.remove('d-none');
    }
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
    // 1. Prescription dropzone file select
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

    // 2. Guest Auth Prompt Modal Button Listeners
    const promptSignInBtn = document.getElementById('promptSignInBtn');
    const guestPromptModalEl = document.getElementById('guestAuthPromptModal');
    const authModalEl = document.getElementById('authModal');

    if (promptSignInBtn) {
      promptSignInBtn.addEventListener('click', () => {
        if (guestPromptModalEl) {
          const bsPrompt = bootstrap.Modal.getInstance(guestPromptModalEl);
          if (bsPrompt) bsPrompt.hide();
        }
        if (authModalEl) {
          const bsAuth = new bootstrap.Modal(authModalEl);
          bsAuth.show();
        }
      });
    }

    // 3. Form Submission
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

        // If user is not authenticated, prompt them to sign in
        if (!AuthService.isAuthenticated()) {
          if (guestPromptModalEl) {
            const bsPrompt = new bootstrap.Modal(guestPromptModalEl);
            bsPrompt.show();
            return;
          }
        }

        await CheckoutPage.executeOrderPlacement();
      });
    }
  },

  /**
   * Execute actual order submission
   */
  executeOrderPlacement: async () => {
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
  }
};
