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
              <a href="../pages/product-details.html?id=${p.id}" class="btn-action-icon text-muted" title="View Storefront Page" target="_blank">
                <i class="bi bi-box-arrow-up-right"></i>
              </a>
              <button class="btn-action-icon text-primary btn-edit-product" data-id="${p.id}" title="Edit Product Details">
                <i class="bi bi-pencil-square"></i>
              </button>
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

  /**
   * Reset modal form to Add Product mode
   */
  resetModalToAddMode: () => {
    const crudForm = document.getElementById('productCrudForm');
    if (crudForm) crudForm.reset();

    const mProdId = document.getElementById('mProdId');
    if (mProdId) mProdId.value = '';

    const titleEl = document.getElementById('productModalTitle');
    if (titleEl) {
      titleEl.innerHTML = '<i class="bi bi-capsule me-2 text-primary"></i>Add New Healthcare Product';
    }

    const submitBtn = document.getElementById('btnProductSubmit');
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Save to Catalog';
    }

    const expiryInput = document.getElementById('mProdExpiry');
    if (expiryInput) {
      const defaultExp = new Date();
      defaultExp.setFullYear(defaultExp.getFullYear() + 2);
      expiryInput.value = defaultExp.toISOString().split('T')[0];
    }

    const imgPreview = document.getElementById('mProdImagePreview');
    if (imgPreview) imgPreview.src = '../assets/images/medicine_1.png';
  },

  /**
   * Populate modal form with selected product and switch to Edit mode
   */
  openEditModal: (p) => {
    const mProdId = document.getElementById('mProdId');
    if (mProdId) mProdId.value = p.id;

    const titleEl = document.getElementById('productModalTitle');
    if (titleEl) {
      titleEl.innerHTML = '<i class="bi bi-pencil-square me-2 text-primary"></i>Edit Healthcare Product';
    }

    const submitBtn = document.getElementById('btnProductSubmit');
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Update Product';
    }

    if (document.getElementById('mProdName')) document.getElementById('mProdName').value = p.name || '';
    if (document.getElementById('mProdBrand')) document.getElementById('mProdBrand').value = p.brand || '';
    if (document.getElementById('mProdCategory')) {
      document.getElementById('mProdCategory').value = p.category || 'medicines';
    }
    if (document.getElementById('mProdPrice')) document.getElementById('mProdPrice').value = p.price || '';
    
    const stockVal = p.stock !== undefined ? p.stock : (p.initialStock !== undefined ? p.initialStock : 50);
    if (document.getElementById('mProdStock')) document.getElementById('mProdStock').value = stockVal;

    if (document.getElementById('mProdExpiry')) {
      if (p.expiryDate && p.expiryDate !== 'N/A (Device)') {
        document.getElementById('mProdExpiry').value = p.expiryDate.split('T')[0];
      } else {
        const defaultExp = new Date();
        defaultExp.setFullYear(defaultExp.getFullYear() + 2);
        document.getElementById('mProdExpiry').value = defaultExp.toISOString().split('T')[0];
      }
    }

    if (document.getElementById('mProdForm')) document.getElementById('mProdForm').value = p.dosageForm || '';
    if (document.getElementById('mProdImage')) document.getElementById('mProdImage').value = p.image || '';
    if (document.getElementById('mProdIngredient')) document.getElementById('mProdIngredient').value = p.activeIngredient || '';
    if (document.getElementById('mProdDesc')) document.getElementById('mProdDesc').value = p.description || '';
    if (document.getElementById('mProdRx')) document.getElementById('mProdRx').checked = !!(p.requiresPrescription || p.rxRequired);
    if (document.getElementById('mProdInStock')) document.getElementById('mProdInStock').checked = p.inStock !== false && stockVal > 0;

    // Update preview image
    const imgPreview = document.getElementById('mProdImagePreview');
    if (imgPreview) {
      imgPreview.src = p.image ? resolveImagePath(p.image) : '../assets/images/medicine_1.png';
      imgPreview.onerror = () => { imgPreview.src = '../assets/images/medicine_1.png'; };
    }

    // Open Bootstrap Modal
    const modalEl = document.getElementById('addProductModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  },

  attachListeners: () => {
    // Default expiry date in modal to 2 years from today
    const expiryInput = document.getElementById('mProdExpiry');
    if (expiryInput && !expiryInput.value) {
      const defaultExp = new Date();
      defaultExp.setFullYear(defaultExp.getFullYear() + 2);
      expiryInput.value = defaultExp.toISOString().split('T')[0];
    }

    // Topbar Add New Product Button click
    const openAddBtn = document.getElementById('btnOpenAddProductModal');
    if (openAddBtn) {
      openAddBtn.addEventListener('click', () => {
        AdminProductsPage.resetModalToAddMode();
      });
    }

    // Search input
    const searchInput = document.getElementById('adminProductSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const filtered = AdminProductsPage.productsList.filter(p => 
          p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q))
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

    // Product Table Actions: Edit & Delete with SweetAlert2
    const tbody = document.getElementById('adminProductsTableBody');
    if (tbody) {
      tbody.addEventListener('click', async (e) => {
        // Edit Product Button
        const editBtn = e.target.closest('.btn-edit-product');
        if (editBtn) {
          const id = parseInt(editBtn.getAttribute('data-id'), 10);
          const product = AdminProductsPage.productsList.find(p => p.id === id);
          if (product) {
            AdminProductsPage.openEditModal(product);
          }
          return;
        }

        // Delete Product Button with SweetAlert2 Confirmation
        const deleteBtn = e.target.closest('.btn-delete-product');
        if (deleteBtn) {
          const id = parseInt(deleteBtn.getAttribute('data-id'), 10);
          const product = AdminProductsPage.productsList.find(p => p.id === id);
          const prodName = product ? product.name : 'this product';

          const result = await Swal.fire({
            title: 'Delete Product?',
            html: `Are you sure you want to delete <strong>${prodName}</strong>?<br><span class="text-danger small"><i class="bi bi-exclamation-triangle-fill me-1"></i> This will permanently remove the item from inventory and the online store.</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#64748b',
            confirmButtonText: '<i class="bi bi-trash-fill me-1"></i> Yes, Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            focusCancel: true
          });

          if (result.isConfirmed) {
            try {
              await ProductService.deleteProduct(id);
              await Swal.fire({
                icon: 'success',
                title: 'Product Deleted',
                text: `"${prodName}" has been removed from the catalog.`,
                confirmButtonColor: '#003B66',
                timer: 2000,
                showConfirmButton: false
              });
              await AdminProductsPage.loadProducts();
            } catch (err) {
              Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: err.message || 'Unable to delete product.',
                confirmButtonColor: '#003B66'
              });
            }
          }
        }
      });
    }

    // Save / Update Product Form with SweetAlert2
    const crudForm = document.getElementById('productCrudForm');
    if (crudForm) {
      crudForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const catSelect = document.getElementById('mProdCategory');
        const catValue = catSelect.value;
        const catText = catSelect.options[catSelect.selectedIndex]?.text || 'Medicines';

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
        const inStockChecked = document.getElementById('mProdInStock')?.checked ?? (parsedStock > 0);

        const editIdVal = document.getElementById('mProdId')?.value;
        const isEditing = Boolean(editIdVal);

        const productPayload = {
          name: document.getElementById('mProdName').value.trim(),
          brand: document.getElementById('mProdBrand').value.trim(),
          brandId: 1,
          category: catValue,
          categoryName: catText,
          categoryId: catId,
          price: parseFloat(document.getElementById('mProdPrice').value),
          activeIngredient: document.getElementById('mProdIngredient')?.value.trim() || 'Clinical Grade Compound',
          dosageForm: document.getElementById('mProdForm')?.value.trim() || 'Unit Pack',
          description: document.getElementById('mProdDesc')?.value.trim() || 'Certified healthcare product.',
          requiresPrescription: document.getElementById('mProdRx')?.checked || false,
          rxRequired: document.getElementById('mProdRx')?.checked || false,
          image: resolvedImg,
          images: [resolvedImg],
          initialStock: parsedStock,
          stock: parsedStock,
          inStock: inStockChecked,
          reorderLevel: 10,
          expiryDate: rawExpiry
        };

        const submitBtn = document.getElementById('btnProductSubmit') || crudForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Processing...';
        }

        if (isEditing) {
          // --- UPDATE PRODUCT ---
          try {
            const updated = await ProductService.updateProduct(parseInt(editIdVal, 10), productPayload);
            const modalEl = document.getElementById('addProductModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            await Swal.fire({
              icon: 'success',
              title: 'Product Updated!',
              html: `<strong>${updated.name || productPayload.name}</strong> details have been saved successfully.`,
              confirmButtonColor: '#003B66',
              confirmButtonText: 'Done',
              timer: 2500
            });

            await AdminProductsPage.loadProducts();
          } catch (err) {
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: err.message || 'Failed to update product details.',
              confirmButtonColor: '#003B66'
            });
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Update Product';
            }
          }
        } else {
          // --- CREATE PRODUCT ---
          try {
            const created = await ProductService.createProduct(productPayload);
            const modalEl = document.getElementById('addProductModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            await Swal.fire({
              icon: 'success',
              title: 'Product Added!',
              html: `<strong>${created.name || productPayload.name}</strong> has been added with <strong>${parsedStock} units</strong> in stock.`,
              confirmButtonColor: '#003B66',
              confirmButtonText: 'Great!',
              timer: 2500
            });

            await AdminProductsPage.loadProducts();
          } catch (err) {
            Swal.fire({
              icon: 'error',
              title: 'Failed to Add Product',
              text: err.message || 'Unable to save new product to catalog.',
              confirmButtonColor: '#003B66'
            });
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Save to Catalog';
            }
          }
        }
      });
    }
  }
};
