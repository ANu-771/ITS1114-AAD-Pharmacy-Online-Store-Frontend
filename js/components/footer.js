/**
 * KK PHARMACY ONLINE PHARMACY - FOOTER COMPONENT (js/components/footer.js)
 * Renders consistent Dark Navy (#003B66) healthcare footer with dynamic relative links.
 */
const FooterComponent = {
  render: (containerId = 'main-footer-container') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const path = window.location.pathname.replace(/\\/g, '/');
    const isSubdir = path.includes('/pages/') || path.includes('/admin/');
    const p = isSubdir ? '../' : '';

    container.innerHTML = `
      <footer class="pharmacy-footer">
        <div class="container">
          <div class="row g-4">
            <!-- Col 1: Branding -->
            <div class="col-12 col-md-4 col-lg-3">
              <div class="d-flex align-items-center gap-2 mb-3">
                <div class="bg-primary text-white rounded-2 d-flex align-items-center justify-content-center" style="width: 34px; height: 34px;">
                  <i class="bi bi-plus-lg fs-5"></i>
                </div>
                <span class="font-heading fw-bold text-white fs-4">KK PHARMACY</span>
              </div>
              <p class="small text-white-50 mb-3">
                Sri Lanka's trusted digital pharmacy and healthcare equipment provider. Certified medications, hospital-grade instruments, and 24/7 pharmacist support.
              </p>
              <div class="d-flex gap-2">
                <a href="#" class="text-white-50 fs-5 me-2"><i class="bi bi-facebook"></i></a>
                <a href="#" class="text-white-50 fs-5 me-2"><i class="bi bi-instagram"></i></a>
                <a href="#" class="text-white-50 fs-5 me-2"><i class="bi bi-linkedin"></i></a>
                <a href="#" class="text-white-50 fs-5 me-2"><i class="bi bi-whatsapp"></i></a>
              </div>
            </div>

            <!-- Col 2: Company -->
            <div class="col-6 col-md-2 col-lg-2">
              <h5>Company</h5>
              <ul>
                <li><a href="${p}pages/about.html">About Us</a></li>
                <li><a href="${p}pages/contact.html">Contact Us</a></li>
                <li><a href="${p}pages/faq.html">Pharmacy Licensing</a></li>
                <li><a href="${p}pages/contact.html">Dispensary Hubs</a></li>
              </ul>
            </div>

            <!-- Col 3: Shop -->
            <div class="col-6 col-md-2 col-lg-2">
              <h5>Shop</h5>
              <ul>
                <li><a href="${p}pages/products.html?category=medicines">Medicines</a></li>
                <li><a href="${p}pages/products.html?category=equipment">Medical Equipment</a></li>
                <li><a href="${p}pages/products.html?category=vitamins">Health & Wellness</a></li>
                <li><a href="${p}pages/categories.html">All Categories</a></li>
              </ul>
            </div>

            <!-- Col 4: Support -->
            <div class="col-6 col-md-2 col-lg-2">
              <h5>Customer Support</h5>
              <ul>
                <li><a href="${p}pages/faq.html">FAQ & Help</a></li>
                <li><a href="${p}pages/orders.html">Track Order</a></li>
                <li><a href="${p}pages/faq.html">Prescription Policy</a></li>
                <li><a href="${p}pages/contact.html">Pharmacist Hotline</a></li>
              </ul>
            </div>

            <!-- Col 5: Contact Info -->
            <div class="col-12 col-md-2 col-lg-3">
              <h5>Clinical Hotline</h5>
              <ul class="small text-white-50">
                <li class="d-flex align-items-center gap-2 mb-2">
                  <i class="bi bi-telephone text-primary fs-6"></i> +94 11 234 5678
                </li>
                <li class="d-flex align-items-center gap-2 mb-2">
                  <i class="bi bi-envelope text-primary fs-6"></i> clinical@medora.lk
                </li>
                <li class="d-flex align-items-center gap-2">
                  <i class="bi bi-geo-alt text-primary fs-6"></i> Colombo 07, Sri Lanka
                </li>
              </ul>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div class="footer-bottom d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div>
              &copy; ${new Date().getFullYear()} KK PHARMACY Digital Pharmacy. Licensed Healthcare Provider under NMRA Regulations.
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-secondary text-white">VISA</span>
              <span class="badge bg-secondary text-white">MasterCard</span>
              <span class="badge bg-secondary text-white">Genie / FriMi</span>
              <span class="badge bg-success text-white">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
};
