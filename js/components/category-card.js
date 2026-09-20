/**
 * KK PHARMACY ONLINE PHARMACY - CATEGORY CARD COMPONENT
 * Renders reusable responsive category card item.
 */
function createCategoryCard(category) {
  const meta = typeof ProductService !== 'undefined' && ProductService._resolveCategoryMeta 
    ? ProductService._resolveCategoryMeta(category) 
    : { slug: category.id || 'medicines', icon: category.icon || 'bi-capsule', watermark: 'bi-capsule', count: category.count || '' };

  const displayIcon = category.icon && category.icon !== 'bi-capsule' ? category.icon : meta.icon;
  const watermarkIcon = category.watermark || meta.watermark || displayIcon;
  const catSlug = category.slug || meta.slug || category.id || 'medicines';
  const countText = category.count || meta.count || '';

  return `
    <div class="col-6 col-md-4 col-lg-2">
      <div class="category-card category-card-${catSlug}" data-category="${category.id}">
        <div class="category-bg-watermark"><i class="bi ${watermarkIcon}"></i></div>
        <div class="category-icon-wrapper">
          <i class="bi ${displayIcon}"></i>
        </div>
        <h6 class="category-title">${category.name}</h6>
        <span class="category-count">${countText}</span>
      </div>
    </div>
  `;
}
