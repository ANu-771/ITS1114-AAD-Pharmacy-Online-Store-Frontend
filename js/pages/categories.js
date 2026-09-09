/**
 * KK PHARMACY ONLINE PHARMACY - CATEGORIES PAGE CONTROLLER (js/pages/categories.js)
 * Loads and displays all medical categories with direct links to filtered product listings.
 */
const CategoriesPage = {
  init: async () => {
    const container = document.getElementById('allCategoriesGrid');
    if (!container) return;

    try {
      const categories = await ProductService.getCategories();
      let html = '';
      categories.forEach(cat => {
        html += `
          <div class="col-12 col-sm-6 col-lg-4">
            <a href="products.html?category=${cat.id}" class="text-decoration-none">
              <div class="category-card p-4 h-100 bg-white border rounded-4 shadow-sm text-center">
                <div class="category-icon-wrapper mx-auto mb-3" style="width: 60px; height: 60px; font-size: 1.8rem; background: var(--light-medical-blue); color: var(--primary-blue); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                  <i class="bi ${cat.icon || 'bi-capsule'}"></i>
                </div>
                <h5 class="fw-bold text-navy mb-1">${cat.name}</h5>
                <p class="text-muted small mb-3">${cat.desc || 'Explore medical essentials'}</p>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 small">
                  ${cat.count || 'Browse Products'}
                </span>
              </div>
            </a>
          </div>
        `;
      });
      container.innerHTML = html;
    } catch (e) {
      console.error('[CategoriesPage] Error:', e);
    }
  }
};
