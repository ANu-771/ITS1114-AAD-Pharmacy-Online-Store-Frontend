/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN PRODUCTS CONTROLLER (js/pages/admin-products.js)
 * Manages product table listing, modal form CRUD operations, search filters, and delete actions.
 */
const AdminProductsPage = {
  productsList: [],

  init: async () => {
    AdminSidebarComponent.render('products');
    await AdminProductsPage.loadProducts();
    AdminProductsPage.attachListeners();
  },

  loadProducts: async () => {
    try {
      const data = await ProductService.getProducts('all');
      AdminProductsPage.productsList = data;
      AdminProductsPage.renderTable(data);
    } catch (e) {
      console.error('[AdminProductsPage] Error loading products:', e);
    }
  },

  renderTable: (products) => {
    const tbody = document.getElementById('adminProductsTableBody');
    const countEl = document.getElementById('adminProductCount');
    if (!tbody) return;

    if (countEl) countEl.textContent = `Showing ${products.length} Products`;

    let html = '';
    products.forEach(p => {
      const imgSrc = resolveImagePath(p.image);
      const fallbackImg = resolveImagePath('assets/images/medicine_1.png');
      html += `
        <tr data-id="${p.id}">
          <td>
            <div class="d-flex align-items-center gap-3">
              <img src="${imgSrc}" alt="${p.name}" class="rounded-2 border p-1" style="width: 44px; height: 44px; object-fit: contain; background: #FFF;" onerror="this.onerror=null; this.src='${fallbackImg}';">
              <div>
                <strong class="text-navy small d-block">${p.name}</strong>
                <small class="text-muted">Brand: ${p.brand}</small>
              </div>
            </div>
          </td>
          <td><span class="badge bg-light text-navy border small">${p.categoryName || p.category}</span></td>
          <td><span class="fw-bold text-primary small">Rs. ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
          <td>
            ${p.requiresPrescription ? '<span class="badge bg-warning-subtle text-warning border border-warning-subtle small">Rx Required</span>' : '<span class="badge bg-light text-muted border small">OTC / General</span>'}
          </td>
          <td>
            <span class="badge-status ${p.inStock ? 'badge-instock' : 'badge-outofstock'}">
              <i class="bi bi-circle-fill" style="font-size: 0.45rem;"></i> ${p.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </td>
          <td class="text-end">
            <div class="d-flex justify-content-end gap-1">
              <a href="../pages/product-details.html?id=${p.id}" class="btn-action-icon" title="View Storefront Page" target="_blank">
                <i class="bi bi-box-arrow-up-right"></i>
              </a>
              <button class="btn-action-icon text-danger btn-delete-product" data-id="${p.id}" title="Delete Product">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  },

  attachListeners: () => {
    // Search input
    const searchInput = document.getElementById('adminProductSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const filtered = AdminProductsPage.productsList.filter(p => 
          p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
        );
        AdminProductsPage.renderTable(filtered);
      });
    }

    // Category select
    const catSelect = document.getElementById('adminCategorySelect');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        const cat = e.target.value;
        if (cat === 'all') {
          AdminProductsPage.renderTable(AdminProductsPage.productsList);
        } else {
          const filtered = AdminProductsPage.productsList.filter(p => p.category === cat);
          AdminProductsPage.renderTable(filtered);
        }
      });
    }

    // Delete Product
    const tbody = document.getElementById('adminProductsTableBody');
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete-product');
        if (deleteBtn) {
          const id = parseInt(deleteBtn.getAttribute('data-id'), 10);
          if (confirm('Are you sure you want to remove this product from the catalog?')) {
            AdminProductsPage.productsList = AdminProductsPage.productsList.filter(p => p.id !== id);
            AdminProductsPage.renderTable(AdminProductsPage.productsList);
            Toast.show('Product removed from database catalog.', 'info');
          }
        }
      });
    }

    // Add Product Form
    const crudForm = document.getElementById('productCrudForm');
    if (crudForm) {
      crudForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newProduct = {
          id: AdminProductsPage.productsList.length + 1,
          name: document.getElementById('mProdName').value.trim(),
          brand: document.getElementById('mProdBrand').value.trim(),
          category: document.getElementById('mProdCategory').value,
          categoryName: document.getElementById('mProdCategory').options[document.getElementById('mProdCategory').selectedIndex].text,
          price: parseFloat(document.getElementById('mProdPrice').value),
          activeIngredient: document.getElementById('mProdIngredient').value.trim() || 'Clinical Grade Compound',
          dosageForm: document.getElementById('mProdForm').value.trim() || 'Unit Pack',
          description: document.getElementById('mProdDesc').value.trim() || 'Newly added certified healthcare product.',
          requiresPrescription: document.getElementById('mProdRx').checked,
          inStock: true,
          rating: 5.0,
          reviewsCount: 1,
          image: 'assets/images/medicine_1.png'
        };

        AdminProductsPage.productsList.unshift(newProduct);
        AdminProductsPage.renderTable(AdminProductsPage.productsList);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        if (modal) modal.hide();
        crudForm.reset();
        Toast.show(`Product "${newProduct.name}" added successfully!`, 'success');
      });
    }
  }
};
