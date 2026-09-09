/**
 * KK PHARMACY ONLINE PHARMACY - SHOPPING CART CONTROLLER (js/pages/cart.js)
 * Manages item listing, quantity increment/decrement, line removal, coupon codes, and shipping threshold calculations.
 */
const CartPage = {
  discountRate: 0,
  deliveryFee: 350.00,

  init: () => {
    CartPage.renderCart();
    CartPage.attachListeners();

    // Listen to global cart update events
    window.addEventListener('cart:updated', () => {
      CartPage.renderCart();
    });
  },

  renderCart: () => {
    const items = CartService.getCartItems();
    const tbody = document.getElementById('cartItemsTbody');
    const emptyView = document.getElementById('emptyCartView');
    const actionsRow = document.getElementById('cartActionsRow');
    const summaryCol = document.getElementById('orderSummaryCol');

    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = '';
      if (emptyView) emptyView.classList.remove('d-none');
      if (actionsRow) actionsRow.classList.add('d-none');
      if (summaryCol) summaryCol.classList.add('d-none');
      CartPage.updateShippingProgress(0);
      return;
    }

    if (emptyView) emptyView.classList.add('d-none');
    if (actionsRow) actionsRow.classList.remove('d-none');
    if (summaryCol) summaryCol.classList.remove('d-none');

    let html = '';
    items.forEach(item => {
      const lineTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1);
      const imgSrc = resolveImagePath(item.image);
      const fallbackImg = resolveImagePath('assets/images/medicine_1.png');

      html += `
        <tr data-id="${item.id}">
          <td class="ps-4 py-3">
            <div class="d-flex align-items-center gap-3">
              <img src="${imgSrc}" alt="${item.name}" class="rounded-3 border" style="width: 60px; height: 60px; object-fit: contain; background: #FFF;" onerror="this.onerror=null; this.src='${fallbackImg}';">
              <div>
                <a href="product-details.html?id=${item.id}" class="fw-bold text-navy text-decoration-none d-block small mb-1">${item.name}</a>
                <span class="badge bg-light text-muted border" style="font-size: 0.7rem;">${item.brand || 'KK PHARMACY'}</span>
                ${item.requiresPrescription ? '<span class="badge bg-warning-subtle text-warning border border-warning-subtle ms-1" style="font-size: 0.65rem;">Rx Required</span>' : ''}
              </div>
            </div>
          </td>
          <td class="py-3 text-center small text-navy fw-semibold">
            Rs. ${parseFloat(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </td>
          <td class="py-3 text-center">
            <div class="input-group input-group-sm mx-auto" style="width: 105px;">
              <button class="btn btn-outline-secondary btn-qty-minus" data-id="${item.id}" type="button">-</button>
              <input type="text" class="form-control text-center fw-bold p-0" value="${item.quantity}" readonly>
              <button class="btn btn-outline-secondary btn-qty-plus" data-id="${item.id}" type="button">+</button>
            </div>
          </td>
          <td class="py-3 text-center fw-bold text-primary small">
            Rs. ${lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </td>
          <td class="pe-4 py-3 text-end">
            <button class="btn btn-sm btn-outline-danger border-0 btn-remove-item" data-id="${item.id}" title="Remove item">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    CartPage.calculateTotals(items);
  },

  calculateTotals: (items) => {
    const subtotal = items.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1)), 0);
    const isFreeDelivery = subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD;
    const actualDelivery = isFreeDelivery || subtotal === 0 ? 0.00 : CartPage.deliveryFee;
    const discountAmount = subtotal * CartPage.discountRate;
    const finalTotal = subtotal + actualDelivery - discountAmount;

    // Update DOM
    if (document.getElementById('summarySubtotal')) {
      document.getElementById('summarySubtotal').textContent = `Rs. ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    
    const deliveryEl = document.getElementById('summaryDelivery');
    if (deliveryEl) {
      if (actualDelivery === 0) {
        deliveryEl.textContent = 'FREE';
        deliveryEl.className = 'fw-semibold text-success';
      } else {
        deliveryEl.textContent = `Rs. ${actualDelivery.toFixed(2)}`;
        deliveryEl.className = 'fw-semibold text-navy';
      }
    }

    const discountRow = document.getElementById('discountRow');
    if (discountRow) {
      if (CartPage.discountRate > 0) {
        discountRow.style.setProperty('display', 'flex', 'important');
        document.getElementById('summaryDiscount').textContent = `- Rs. ${discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      } else {
        discountRow.style.setProperty('display', 'none', 'important');
      }
    }

    if (document.getElementById('summaryTotal')) {
      document.getElementById('summaryTotal').textContent = `Rs. ${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    CartPage.updateShippingProgress(subtotal);
  },

  updateShippingProgress: (subtotal) => {
    const threshold = CONFIG.FREE_SHIPPING_THRESHOLD;
    const progressBar = document.getElementById('shippingProgressBar');
    const textEl = document.getElementById('shippingProgressText');
    const badgeEl = document.getElementById('shippingStatusBadge');

    if (!progressBar || !textEl) return;

    if (subtotal >= threshold) {
      progressBar.style.width = '100%';
      progressBar.className = 'progress-bar bg-success';
      textEl.innerHTML = '<i class="bi bi-check-circle-fill text-success me-1"></i> <strong>Congratulations!</strong> You have unlocked FREE Island-wide Delivery!';
      if (badgeEl) {
        badgeEl.textContent = 'Free Delivery Unlocked!';
        badgeEl.className = 'badge bg-success rounded-pill small';
      }
    } else {
      const percentage = Math.min(100, Math.round((subtotal / threshold) * 100));
      const remaining = threshold - subtotal;
      progressBar.style.width = `${percentage}%`;
      progressBar.className = 'progress-bar bg-primary';
      textEl.textContent = `Add Rs. ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} more to get FREE Island-wide Delivery!`;
      if (badgeEl) {
        badgeEl.textContent = `${percentage}% towards Free`;
        badgeEl.className = 'badge bg-primary rounded-pill small';
      }
    }
  },

  attachListeners: () => {
    const tbody = document.getElementById('cartItemsTbody');
    if (tbody && !tbody._hasCartActionHandler) {
      tbody._hasCartActionHandler = true;
      tbody.addEventListener('click', (e) => {
        const minusBtn = e.target.closest('.btn-qty-minus');
        const plusBtn = e.target.closest('.btn-qty-plus');
        const removeBtn = e.target.closest('.btn-remove-item');

        if (minusBtn) {
          const id = parseInt(minusBtn.getAttribute('data-id'), 10);
          const item = CartService.getCartItems().find(i => i.id === id);
          if (item) {
            if (item.quantity > 1) {
              CartService.updateQuantity(id, item.quantity - 1);
            } else {
              CartService.removeFromCart(id);
            }
          }
        } else if (plusBtn) {
          const id = parseInt(plusBtn.getAttribute('data-id'), 10);
          const item = CartService.getCartItems().find(i => i.id === id);
          if (item) {
            CartService.updateQuantity(id, item.quantity + 1);
          }
        } else if (removeBtn) {
          const id = parseInt(removeBtn.getAttribute('data-id'), 10);
          CartService.removeFromCart(id);
          Toast.show('Item removed from cart.', 'info');
        }
      });
    }

    // Clear cart button
    document.getElementById('clearCartBtn')?.addEventListener('click', () => {
      CartService.clearCart();
      Toast.show('Your cart has been cleared.', 'info');
    });

    // Apply coupon
    document.getElementById('applyCouponBtn')?.addEventListener('click', () => {
      const code = document.getElementById('couponCodeInput')?.value.trim().toUpperCase();
      if (code === 'MEDORA10') {
        CartPage.discountRate = 0.10;
        Toast.show('Coupon MEDORA10 applied! 10% discount added.', 'success');
        CartPage.renderCart();
      } else if (code) {
        Toast.show('Invalid or expired coupon code.', 'warning');
      }
    });
  }
};
