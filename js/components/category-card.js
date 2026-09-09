/**
 * KK PHARMACY ONLINE PHARMACY - CATEGORY CARD COMPONENT
 * Renders reusable responsive category card item.
 */
function createCategoryCard(category) {
  return `
    <div class="col-6 col-md-4 col-lg-2">
      <div class="category-card" data-category="${category.id}">
        <div class="category-icon-wrapper">
          <i class="bi ${category.icon}"></i>
        </div>
        <h6 class="category-title">${category.name}</h6>
        <span class="category-count">${category.count || ''}</span>
      </div>
    </div>
  `;
}
