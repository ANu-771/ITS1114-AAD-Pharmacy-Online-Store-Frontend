/**
 * KK PHARMACY ONLINE PHARMACY - SERVER HEALTH GATE COMPONENT (js/components/server-gate.js)
 * Displays a branded splash loading screen and strictly blocks the website if the backend API is offline.
 */
const ServerGate = {
  overlayEl: null,
  isChecking: false,

  /**
   * Inject splash overlay immediately to prevent content flash
   */
  injectOverlay: () => {
    if (document.getElementById('kk-server-gate-overlay')) {
      ServerGate.overlayEl = document.getElementById('kk-server-gate-overlay');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'kk-server-gate-overlay';
    overlay.innerHTML = `
      <div class="gate-brand-wrapper" id="gateLoadingContent">
        <div class="gate-brand-icon">
          <i class="bi bi-plus-lg"></i>
        </div>
        <div class="gate-brand-title">KK PHARMACY</div>
        <div class="gate-brand-subtitle">HEALTHCARE SYSTEM</div>
        <div class="gate-status-text" id="gateStatusText">Verifying secure server connectivity...</div>
        <div class="gate-loader-bar">
          <div class="gate-loader-track"></div>
        </div>
      </div>
      <div id="gateOfflineContainer" style="display: none; width: 100%; display: flex; justify-content: center;"></div>
    `;

    // Prepend to body or documentElement so it renders on top
    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('kk-server-gate-overlay')) {
          document.body.appendChild(overlay);
        }
      });
    }

    ServerGate.overlayEl = overlay;
  },

  /**
   * Verify server connectivity via lightweight health ping
   */
  verify: async (forceRecheck = false) => {
    ServerGate.injectOverlay();

    // Show loading state
    const loadingContent = document.getElementById('gateLoadingContent');
    const offlineContainer = document.getElementById('gateOfflineContainer');
    const statusText = document.getElementById('gateStatusText');

    if (loadingContent) loadingContent.style.display = 'flex';
    if (offlineContainer) {
      offlineContainer.style.display = 'none';
      offlineContainer.innerHTML = '';
    }
    if (statusText) statusText.textContent = 'Verifying secure server connectivity...';

    // Ensure overlay is visible
    if (ServerGate.overlayEl) {
      ServerGate.overlayEl.classList.remove('gate-hidden');
      ServerGate.overlayEl.style.display = 'flex';
    }

    // Resolve ping URL from CONFIG
    const apiBase = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) 
      ? CONFIG.API_BASE_URL 
      : 'http://localhost:8080/api/v1';
    const pingUrl = `${apiBase}/test/ping`;

    try {
      ServerGate.isChecking = true;

      // 5-second timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Attempt ping (supports both GET and POST)
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: { 'Accept': 'text/plain, application/json, */*' },
        signal: controller.signal
      }).catch(async (err) => {
        // If GET fails with 405 Method Not Allowed, fallback to POST
        return await fetch(pingUrl, {
          method: 'POST',
          headers: { 'Accept': 'text/plain, application/json, */*' },
          signal: controller.signal
        });
      });

      clearTimeout(timeoutId);

      if (response && response.ok) {
        console.log('✅ [ServerGate] KK Pharmacy core backend is ONLINE.');
        sessionStorage.setItem('kk_server_online', 'true');
        ServerGate.unlock();
        return true;
      } else {
        throw new Error(`Server returned HTTP ${response ? response.status : 'No Response'}`);
      }
    } catch (err) {
      console.warn('❌ [ServerGate] Server is unreachable or offline:', err.message);
      sessionStorage.removeItem('kk_server_online');
      ServerGate.showOffline(apiBase, err.message);
      return false;
    } finally {
      ServerGate.isChecking = false;
    }
  },

  /**
   * Smoothly fade out overlay and grant site access
   */
  unlock: () => {
    if (!ServerGate.overlayEl) return;
    
    // Add brief smooth delay for visual polish
    setTimeout(() => {
      ServerGate.overlayEl.classList.add('gate-hidden');
      setTimeout(() => {
        ServerGate.overlayEl.style.display = 'none';
      }, 450);
    }, 400);
  },

  /**
   * Block site with Strict Offline Blocker Alert & Retry button
   */
  showOffline: (apiBase, errMsg) => {
    const loadingContent = document.getElementById('gateLoadingContent');
    const offlineContainer = document.getElementById('gateOfflineContainer');

    if (loadingContent) loadingContent.style.display = 'none';
    if (!offlineContainer) return;

    offlineContainer.style.display = 'flex';
    offlineContainer.innerHTML = `
      <div class="gate-offline-card">
        <div class="gate-offline-icon">
          <i class="bi bi-shield-x"></i>
        </div>
        <div class="gate-offline-title">Pharmacy Core Server Offline</div>
        <p class="gate-offline-msg">
          Unable to establish a secure connection to KK Pharmacy backend services. 
          To protect patient safety, prescription validation, and live stock accuracy, the store is temporarily paused until connectivity is restored.
        </p>
        <div class="mt-4">
          <button class="btn-gate-retry" id="btnGateRetry">
            <i class="bi bi-arrow-clockwise fs-5"></i> Retry Connection
          </button>
        </div>
      </div>
    `;

    const retryBtn = document.getElementById('btnGateRetry');
    if (retryBtn) {
      retryBtn.addEventListener('click', async () => {
        retryBtn.disabled = true;
        retryBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Testing Connection...';
        await ServerGate.verify(true);
      });
    }
  }
};

// Immediate early injection
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ServerGate.injectOverlay);
  } else {
    ServerGate.injectOverlay();
  }
}
