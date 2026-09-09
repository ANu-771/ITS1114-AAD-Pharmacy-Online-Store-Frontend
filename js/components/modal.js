/**
 * KK PHARMACY ONLINE PHARMACY - MODAL HELPER COMPONENT (js/components/modal.js)
 * Renders Quick View and Global Search overlay modals dynamically.
 */
const Modal = {
  showQuickView: (product) => {
    let modalEl = document.getElementById('quickViewModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'quickViewModal';
      modalEl.className = 'modal fade';
      modalEl.tabIndex = -1;
      document.body.appendChild(modalEl);
    }

    const resolvedImg = resolveImagePath(product.image);
    const fallbackImg = resolveImagePath('assets/images/medicine_1.png');

    modalEl.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
          <div class="modal-header border-0 pb-0">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row align-items-center">
              <div class="col-md-6 text-center mb-3 mb-md-0">
                <div class="p-3 bg-light rounded-3">
                  <img src="${resolvedImg}" alt="${product.name}" class="img-fluid" style="max-height: 240px; object-fit: contain;" onerror="this.onerror=null; this.src='${fallbackImg}';">
                </div>
              </div>
              <div class="col-md-6">
                <span class="badge bg-primary-subtle text-primary fw-semibold mb-2">${product.brand}</span>
                <h4 class="fw-bold mb-2" style="color: #003B66;">${product.name}</h4>
                
                <div class="d-flex align-items-center gap-2 mb-3">
                  <div class="text-warning small">
                    <i class="bi bi-star-fill"></i> ${product.rating}
                  </div>
                  <span class="text-muted small">(${product.reviewsCount} customer reviews)</span>
                </div>

                <div class="d-flex align-items-baseline gap-2 mb-3">
                  <span class="fs-3 fw-bold" style="color: #0066B3;">Rs. ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  ${product.oldPrice ? `<span class="text-muted text-decoration-line-through">Rs. ${product.oldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>` : ''}
                </div>

                <p class="text-muted small mb-4">
                  ${product.description || 'High quality healthcare product certified for safe domestic and professional usage.'}
                </p>

                ${product.requiresPrescription ? `
                  <div class="alert alert-warning py-2 small d-flex align-items-center gap-2 mb-3">
                    <i class="bi bi-file-earmark-medical fs-5"></i>
                    <div><strong>Prescription Required:</strong> Please have your doctor's Rx ready upon order confirmation.</div>
                  </div>
                ` : ''}

                <div class="d-flex gap-2">
                  <button class="btn btn-primary-pharmacy flex-grow-1 btn-modal-cart" data-id="${product.id}">
                    <i class="bi bi-cart-plus"></i> Add to Shopping Cart
                  </button>
                  <button class="btn btn-outline-pharmacy btn-modal-wishlist" data-id="${product.id}">
                    <i class="bi bi-heart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    modalEl.querySelector('.btn-modal-cart').addEventListener('click', () => {
      CartService.addToCart(product, 1);
      bsModal.hide();
    });

    modalEl.querySelector('.btn-modal-wishlist').addEventListener('click', () => {
      Toast.show(`Added ${product.name} to your Wishlist!`, 'info');
    });
  }
};
