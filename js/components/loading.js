/**
 * KK PHARMACY ONLINE PHARMACY - LOADING & UI STATES COMPONENT
 * Renders loading skeletons, empty state, and error message cards.
 */
const LoadingState = {
  renderProductSkeletons: (containerId, count = 4) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm p-3 h-100 skeleton-card">
            <div class="skeleton mb-3" style="height: 140px;"></div>
            <div class="skeleton mb-2" style="height: 16px; width: 40%;"></div>
            <div class="skeleton mb-2" style="height: 20px; width: 80%;"></div>
            <div class="skeleton mb-3" style="height: 16px; width: 60%;"></div>
            <div class="skeleton mt-auto" style="height: 36px;"></div>
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  },

  renderEmpty: (containerId, message = 'No products found matching your criteria.') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="p-4 bg-white rounded-4 border shadow-sm mx-auto" style="max-width: 450px;">
          <div class="bg-light rounded-circle d-inline-flex p-3 mb-3 text-primary">
            <i class="bi bi-search fs-1"></i>
          </div>
          <h5 class="fw-bold text-navy mb-2">No Products Found</h5>
          <p class="text-muted small mb-0">${message}</p>
        </div>
      </div>
    `;
  },

  renderError: (containerId, message = 'Something went wrong. Please check your connection and try again.') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="p-4 bg-white rounded-4 border border-danger-subtle shadow-sm mx-auto" style="max-width: 480px;">
          <div class="bg-danger-subtle rounded-circle d-inline-flex p-3 mb-3 text-danger">
            <i class="bi bi-exclamation-triangle fs-1"></i>
          </div>
          <h5 class="fw-bold text-danger mb-2">Unable to Load Products</h5>
          <p class="text-muted small mb-3">${message}</p>
          <button class="btn btn-outline-pharmacy btn-sm" onclick="location.reload()">
            <i class="bi bi-arrow-clockwise"></i> Try Again
          </button>
        </div>
      </div>
    `;
  }
};
