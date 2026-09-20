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
        const catVariant = `category-card-${cat.slug || cat.id || 'medicines'}`;
        const displayIcon = cat.icon || 'bi-capsule';
        const watermarkIcon = cat.watermark || cat.icon || 'bi-capsule';

        html += `
          <div class="col-12 col-sm-6 col-lg-4">
            <a href="products.html?category=${cat.id}" class="text-decoration-none">
              <div class="category-card-premium ${catVariant} h-100 text-center">
                <div class="category-bg-watermark"><i class="bi ${watermarkIcon}"></i></div>
                <div class="category-icon-wrapper mx-auto mb-3">
                  <i class="bi ${displayIcon}"></i>
                </div>
                <h5 class="category-title mb-1">${cat.name}</h5>
                <p class="category-desc mb-3">${cat.desc || 'Explore medical essentials'}</p>
                <span class="category-count-badge">
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
