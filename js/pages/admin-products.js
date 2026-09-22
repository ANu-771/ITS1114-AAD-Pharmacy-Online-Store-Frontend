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
      AdminProductsPage.renderAlerts(data);
      AdminProductsPage.renderTable(data);
    } catch (e) {
      console.error('[AdminProductsPage] Error loading products:', e);
    }
  },

  renderAlerts: (products) => {
    const alertsContainer = document.getElementById('adminAlertsContainer');
    const nearExpiryList = document.getElementById('nearExpiryList');
    const lowStockList = document.getElementById('lowStockList');
    const nearExpiryCountText = document.getElementById('nearExpiryCountText');
    const lowStockCountText = document.getElementById('lowStockCountText');

    if (!alertsContainer || !nearExpiryList || !lowStockList) return;

    const now = new Date();
    const nearExpiryItems = [];
    const lowStockItems = [];

    products.forEach(p => {
      const stockVal = p.stock !== undefined ? p.stock : (p.initialStock !== undefined ? p.initialStock : (p.inStock ? 50 : 0));
      
      // Check stock
      if (stockVal <= 10) {
        lowStockItems.push({ ...p, currentStock: stockVal });
      }

      // Check expiry date
      if (p.expiryDate) {
        const expDate = new Date(p.expiryDate);
        if (!isNaN(expDate.getTime())) {
          const diffTime = expDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          // Expiring within 90 days (3 months) or already expired
          if (diffDays <= 90) {
            nearExpiryItems.push({
              ...p,
              diffDays,
              isExpired: diffDays <= 0,
              formattedExpiry: expDate.toISOString().split('T')[0]
            });
          }
        }
      } else if (p.expiringSoon) {
        nearExpiryItems.push({
          ...p,
          diffDays: 45,
          isExpired: false,
          formattedExpiry: 'Expiring Soon'
        });
      }
    });

    // Render Near Expiry Alerts
    if (nearExpiryCountText) {
      nearExpiryCountText.textContent = `${nearExpiryItems.length} Critical Expiry Alerts (< 3 Months)`;
    }
    if (nearExpiryItems.length === 0) {
      nearExpiryList.innerHTML = '<div class="text-success"><i class="bi bi-shield-check me-1"></i> All medicine batches are well within safe shelf-life (> 3 months).</div>';
    } else {
      nearExpiryList.innerHTML = nearExpiryItems.map(item => `
        <div class="d-flex align-items-center justify-content-between py-1 border-bottom border-warning-subtle">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-clock-history ${item.isExpired ? 'text-danger' : 'text-warning'}"></i>
            <span class="fw-semibold text-dark">${item.name}</span>
          </div>
          <div>
            ${item.isExpired 
              ? '<span class="badge bg-danger text-white">EXPIRED (' + item.formattedExpiry + ')</span>' 
              : '<span class="badge bg-warning text-dark font-monospace">' + item.diffDays + ' days left (' + item.formattedExpiry + ')</span>'}
          </div>
        </div>
      `).join('');
    }

    // Render Low Stock Alerts
    if (lowStockCountText) {
      lowStockCountText.textContent = `${lowStockItems.length} Low Stock Alerts`;
    }
    if (lowStockItems.length === 0) {
      lowStockList.innerHTML = '<div class="text-success"><i class="bi bi-check-circle me-1"></i> Inventory levels are healthy across all product lines.</div>';
    } else {
      lowStockList.innerHTML = lowStockItems.map(item => `
        <div class="d-flex align-items-center justify-content-between py-1 border-bottom border-danger-subtle">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-box-seam text-danger"></i>
            <span class="fw-semibold text-dark">${item.name}</span>
          </div>
          <div>
            <span class="badge ${item.currentStock === 0 ? 'bg-danger text-white' : 'bg-warning text-dark'} font-monospace">
              ${item.currentStock === 0 ? '0 Units (OUT OF STOCK)' : item.currentStock + ' Units Left'}
            </span>
          </div>
        </div>
      `).join('');
    }

    alertsContainer.classList.remove('d-none');
  },

  renderTable: (products) => {
    const tbody = document.getElementById('adminProductsTableBody');
    const countEl = document.getElementById('adminProductCount');
    if (!tbody) return;

    if (countEl) countEl.textContent = `Showing ${products.length} Products`;

    const now = new Date();
    let html = '';
    products.forEach(p => {
      const imgSrc = resolveImagePath(p.image);
      const fallbackImg = resolveImagePath('assets/images/medicine_1.png');
      const stockVal = p.stock !== undefined ? p.stock : (p.initialStock !== undefined ? p.initialStock : (p.inStock ? 50 : 0));
      
      // Expiry status badge
      let expiryBadge = '<span class="badge bg-light text-muted border font-monospace">Not Set</span>';
      if (p.expiryDate) {
        const exp = new Date(p.expiryDate);
        if (!isNaN(exp.getTime())) {
          const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const dateStr = exp.toISOString().split('T')[0];
          if (diffDays <= 0) {
            expiryBadge = `<span class="badge bg-danger text-white border font-monospace" title="Expired"><i class="bi bi-exclamation-triangle-fill me-1"></i>Expired (${dateStr})</span>`;
          } else if (diffDays <= 90) {
            expiryBadge = `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning font-monospace" title="Expiring within 3 months"><i class="bi bi-clock-history me-1"></i>${dateStr} (${diffDays}d)</span>`;
          } else {
            expiryBadge = `<span class="badge bg-success-subtle text-success border border-success-subtle font-monospace" title="Safe Batch"><i class="bi bi-shield-check me-1"></i>${dateStr}</span>`;
          }
        }
      } else if (p.expiringSoon) {
        expiryBadge = `<span class="badge bg-warning-subtle text-warning border border-warning font-monospace"><i class="bi bi-clock-history me-1"></i>Near Expiry</span>`;
      }

      html += `
        <tr data-id="${p.id}">
          <td>
            <div class="d-flex align-items-center gap-3">
              <img src="${imgSrc}" alt="${p.name}" class="rounded-2 border p-1" style="width: 44px; height: 44px; object-fit: contain; background: #FFF;" onerror="this.onerror=null; this.src='${fallbackImg}';">
              <div>
                <strong class="text-navy small d-block">${p.name}</strong>
                <small class="text-muted">Brand: ${p.brand || 'KK PHARMACY'}</small>
              </div>
            </div>
          </td>
          <td><span class="badge-category-yellow">${p.categoryName || p.category}</span></td>
          <td><span class="fw-bold text-primary small">Rs. ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
          <td>
            <span class="badge ${stockVal > 10 ? 'bg-success-subtle text-success border border-success-subtle' : (stockVal > 0 ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle')} fw-semibold small">
              <i class="bi ${stockVal > 0 ? 'bi-boxes' : 'bi-slash-circle'} me-1"></i> ${stockVal} units
            </span>
          </td>
          <td>${expiryBadge}</td>
          <td>
            ${p.requiresPrescription ? '<span class="badge bg-warning-subtle text-warning border border-warning-subtle small">Rx Required</span>' : '<span class="badge bg-light text-muted border small">OTC / General</span>'}
          </td>
          <td>
            <span class="badge-status ${stockVal > 0 ? 'badge-instock' : 'badge-outofstock'}">
              <i class="bi bi-circle-fill" style="font-size: 0.45rem;"></i> ${stockVal > 0 ? 'In Stock' : 'Out of Stock'}
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
    // Default expiry date in modal to 2 years from today
    const expiryInput = document.getElementById('mProdExpiry');
    if (expiryInput && !expiryInput.value) {
      const defaultExp = new Date();
      defaultExp.setFullYear(defaultExp.getFullYear() + 2);
      expiryInput.value = defaultExp.toISOString().split('T')[0];
    }

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

    // Live Image Preview in Add/Edit Product Modal
    const imgInput = document.getElementById('mProdImage');
    const imgPreview = document.getElementById('mProdImagePreview');
    const btnPreview = document.getElementById('btnPreviewImage');
    const updateImagePreview = () => {
      if (!imgInput || !imgPreview) return;
      const url = imgInput.value.trim();
      if (url) {
        imgPreview.src = resolveImagePath(url);
        imgPreview.onerror = () => {
          imgPreview.src = '../assets/images/medicine_1.png';
        };
      } else {
        imgPreview.src = '../assets/images/medicine_1.png';
      }
    };

    if (imgInput) {
      imgInput.addEventListener('input', updateImagePreview);
      imgInput.addEventListener('paste', () => setTimeout(updateImagePreview, 50));
    }
    if (btnPreview) {
      btnPreview.addEventListener('click', updateImagePreview);
    }

    // Delete Product
    const tbody = document.getElementById('adminProductsTableBody');
    if (tbody) {
      tbody.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.btn-delete-product');
        if (deleteBtn) {
          const id = parseInt(deleteBtn.getAttribute('data-id'), 10);
          if (confirm('Are you sure you want to remove this product from the catalog?')) {
            try {
              await ProductService.deleteProduct(id);
              Toast.show('Product removed from database catalog.', 'info');
              await AdminProductsPage.loadProducts();
            } catch (err) {
              Toast.show(err.message || 'Failed to delete product.', 'error');
            }
          }
        }
      });
    }

    // Add Product Form
    const crudForm = document.getElementById('productCrudForm');
    if (crudForm) {
      crudForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const catSelect = document.getElementById('mProdCategory');
        const catValue = catSelect.value;
        const catText = catSelect.options[catSelect.selectedIndex]?.text || 'Medicines';

        // Map category ID fallback
        let catId = 1;
        if (catValue === 'equipment') catId = 2;
        else if (catValue === 'vitamins') catId = 3;
        else if (catValue === 'personal-care') catId = 4;

        const stockInput = document.getElementById('mProdStock');
        const rawStock = stockInput ? parseInt(stockInput.value, 10) : 50;
        const parsedStock = isNaN(rawStock) ? 50 : Math.max(0, rawStock);

        const customImg = imgInput ? imgInput.value.trim() : '';
        const resolvedImg = customImg || 'assets/images/medicine_1.png';
        const rawExpiry = document.getElementById('mProdExpiry') ? document.getElementById('mProdExpiry').value : '';

        const newProductPayload = {
          name: document.getElementById('mProdName').value.trim(),
          brand: document.getElementById('mProdBrand').value.trim(),
          brandId: 1, // Default verified brand ID
          category: catValue,
          categoryName: catText,
          categoryId: catId,
          price: parseFloat(document.getElementById('mProdPrice').value),
          activeIngredient: document.getElementById('mProdIngredient')?.value.trim() || 'Clinical Grade Compound',
          dosageForm: document.getElementById('mProdForm')?.value.trim() || 'Unit Pack',
          description: document.getElementById('mProdDesc')?.value.trim() || 'Newly added certified healthcare product.',
          requiresPrescription: document.getElementById('mProdRx')?.checked || false,
          rxRequired: document.getElementById('mProdRx')?.checked || false,
          image: resolvedImg,
          images: [resolvedImg],
          initialStock: parsedStock,
          stock: parsedStock,
          inStock: parsedStock > 0,
          reorderLevel: 10,
          expiryDate: rawExpiry
        };

        const submitBtn = crudForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Saving...';
        }

        try {
          const created = await ProductService.createProduct(newProductPayload);
          const modalEl = document.getElementById('addProductModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
          crudForm.reset();
          if (expiryInput) {
            const defaultExp = new Date();
            defaultExp.setFullYear(defaultExp.getFullYear() + 2);
            expiryInput.value = defaultExp.toISOString().split('T')[0];
          }
          if (imgPreview) imgPreview.src = '../assets/images/medicine_1.png';
          Toast.show(`Product "${created.name || newProductPayload.name}" added with ${parsedStock} units in stock!`, 'success');
          await AdminProductsPage.loadProducts();
        } catch (err) {
          Toast.show(err.message || 'Failed to add product.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Save to Catalog';
          }
        }
      });
    }
  }
};
