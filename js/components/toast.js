/**
 * KK PHARMACY ONLINE PHARMACY - TOAST NOTIFICATION COMPONENT
 */
const Toast = {
  container: null,

  _initContainer: () => {
    if (!Toast.container) {
      const div = document.createElement('div');
      div.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      div.style.zIndex = '1090';
      document.body.appendChild(div);
      Toast.container = div;
    }
  },

  show: (message, type = 'success', duration = 3500) => {
    Toast._initContainer();

    const iconMap = {
      success: 'bi-check-circle-fill text-success',
      error: 'bi-exclamation-triangle-fill text-danger',
      warning: 'bi-exclamation-circle-fill text-warning',
      info: 'bi-info-circle-fill text-primary'
    };

    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center show border-0 shadow-lg mb-2';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.style.backgroundColor = '#FFFFFF';
    toastEl.style.borderRadius = '10px';
    toastEl.style.borderLeft = `5px solid ${type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#0066B3'}`;

    toastEl.innerHTML = `
      <div class="d-flex p-3 align-items-center">
        <i class="bi ${iconMap[type] || iconMap.info} fs-4 me-3"></i>
        <div class="toast-body p-0 text-dark fw-500" style="font-size: 0.9rem;">
          ${message}
        </div>
        <button type="button" class="btn-close ms-auto me-1" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    Toast.container.appendChild(toastEl);

    const closeBtn = toastEl.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
      toastEl.remove();
    });

    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.remove(), 300);
      }
    }, duration);
  }
};
