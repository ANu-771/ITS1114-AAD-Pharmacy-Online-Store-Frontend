/**
 * KK PHARMACY ONLINE PHARMACY — MEDIMATE AI CHATBOT CONTROLLER
 * File: js/pages/chat-bot.js
 * 
 * Secure Enterprise AI Assistant Architecture:
 * - Communicates with backend proxy endpoint (/api/v1/chat)
 * - Google Gemini API Key is kept 100% confidential on the Spring Boot server
 * - Zero client-side key exposure
 * - Removed mock fallbacks: If the AI API is unconfigured or offline, transparently informs the user
 * - Interactive site-entry welcome bubble (Intercom/Zendesk style) with dismissal session memory
 */
const MediMateChatBot = {
  isOpen: false,
  isGenerating: false,
  history: [], // Conversation memory for contextual multi-turn chat
  initialized: false,

  /**
   * Initialize chatbot widget and attach to DOM
   */
  init: () => {
    // Only initialize once and avoid loading inside admin dashboard
    if (MediMateChatBot.initialized || document.querySelector('.admin-layout')) return;

    MediMateChatBot.renderUI();
    MediMateChatBot.attachEventListeners();
    MediMateChatBot.initialized = true;

    // Trigger site-entry welcome notification after 2.5 seconds
    setTimeout(() => {
      MediMateChatBot.showWelcomeBubble();
    }, 2500);

    console.log('🤖 [MediMate] AI Assistant initialized with secure Backend Proxy architecture.');
  },

  /**
   * Render the floating chat widget UI into the DOM
   */
  renderUI: () => {
    // Prevent duplicate widget injection
    if (document.getElementById('medimate-container')) return;

    const container = document.createElement('div');
    container.id = 'medimate-container';
    container.innerHTML = `
      <!-- Floating Action Button -->
      <button class="ai-assistant-fab" id="medimateFab" title="Chat with MediMate AI Pharmacist" aria-label="Open MediMate AI Chat">
        <i class="bi bi-robot"></i>
        <span class="fab-badge">AI</span>
      </button>

      <!-- MediMate Chat Window -->
      <div class="ai-chat-window" id="medimateWindow" role="dialog" aria-labelledby="medimateTitle" aria-hidden="true" inert>
        <!-- Header -->
        <div class="ai-chat-header d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <div class="bg-primary p-2 rounded-circle text-white shadow-sm" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <i class="bi bi-robot fs-5"></i>
            </div>
            <div>
              <div class="fw-bold text-white small" id="medimateTitle">MediMate</div>
              <small class="text-white-50 d-flex align-items-center" style="font-size: 0.7rem;">
                <span class="pulse-dot me-1"></span> Clinical & Store AI Advisor
              </small>
            </div>
          </div>
          <div class="d-flex align-items-center gap-1">
            <button class="btn btn-sm text-white-50 p-1 border-0" id="medimateClearBtn" title="Clear Chat History" aria-label="Clear Chat History">
              <i class="bi bi-arrow-counterclockwise fs-6"></i>
            </button>
            <button class="btn btn-sm text-white-50 p-1 border-0" id="medimateCloseBtn" title="Close Chat" aria-label="Close Chat">
              <i class="bi bi-x-lg fs-6"></i>
            </button>
          </div>
        </div>

        <!-- Chat Body / Messages Container -->
        <div class="ai-chat-body" id="medimateMessages" tabindex="0">
          <!-- Initial Bot Greeting -->
          <div class="chat-bubble chat-bubble-ai shadow-sm">
            <div class="fw-bold text-primary mb-1 d-flex align-items-center gap-1">
              <i class="bi bi-patch-check-fill text-primary"></i> KK PHARMACY Clinical AI Assistant
            </div>
            👋 Hello! I'm <strong>MediMate</strong>, your personal KK PHARMACY Healthcare & Clinical Assistant.
            <div class="my-2">
              How can I help you today? You can ask me about:
              <ul class="mb-1 ps-3 mt-1 small">
                <li><strong>Medicines & OTC Guidance</strong> (Dosage, active ingredients, usage)</li>
                <li><strong>Prescriptions</strong> (How to upload & verify Rx orders)</li>
                <li><strong>Medical Equipment</strong> (BP monitors, glucometers, nebulizers)</li>
                <li><strong>Orders & Free Delivery</strong> across Sri Lanka</li>
              </ul>
            </div>
            <div class="small text-muted border-top pt-1 mt-2">
              <em>⚠️ Disclaimer: Advice is for informational guidance. Always consult a qualified physician for emergencies.</em>
            </div>
          </div>

          <!-- Suggested Quick Prompts Row -->
          <div class="quick-prompts-container mt-2 mb-1" id="medimateQuickPrompts">
            <div class="small fw-bold text-muted mb-1" style="font-size: 0.72rem;">Suggested Questions:</div>
            <div class="d-flex flex-wrap gap-1">
              <button type="button" class="btn btn-sm btn-outline-primary py-1 px-2 rounded-pill quick-prompt-btn" style="font-size: 0.72rem;" data-prompt="What is the adult dosage for Paracetamol?">
                Paracetamol Dosage
              </button>
              <button type="button" class="btn btn-sm btn-outline-primary py-1 px-2 rounded-pill quick-prompt-btn" style="font-size: 0.72rem;" data-prompt="How do I upload a doctor prescription?">
                Prescription Upload
              </button>
              <button type="button" class="btn btn-sm btn-outline-primary py-1 px-2 rounded-pill quick-prompt-btn" style="font-size: 0.72rem;" data-prompt="What medical devices do you have in stock?">
                Medical Equipment
              </button>
              <button type="button" class="btn btn-sm btn-outline-primary py-1 px-2 rounded-pill quick-prompt-btn" style="font-size: 0.72rem;" data-prompt="How does free islandwide delivery work?">
                Free Delivery Info
              </button>
            </div>
          </div>
        </div>

        <!-- Chat Input Footer -->
        <form class="ai-chat-footer" id="medimateForm">
          <div class="input-group">
            <input type="text" id="medimateInput" class="form-control form-control-sm border-light-subtle" placeholder="Ask about medicines, dosage, orders..." required autocomplete="off">
            <button type="submit" class="btn btn-primary-pharmacy btn-sm px-3" id="medimateSendBtn" title="Send message">
              <i class="bi bi-send-fill"></i>
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(container);
  },

  /**
   * Interactive site-entry welcome speech bubble (Intercom/Zendesk style)
   */
  showWelcomeBubble: () => {
    if (MediMateChatBot.isOpen) return;
    if (sessionStorage.getItem('medimate_welcome_dismissed') === 'true') return;
    if (document.getElementById('medimateWelcomeBubble')) return;

    const bubble = document.createElement('div');
    bubble.id = 'medimateWelcomeBubble';
    bubble.className = 'ai-welcome-bubble';
    bubble.innerHTML = `
      <div class="d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle p-1" style="width: 30px; height: 30px; flex-shrink: 0;">
        <i class="bi bi-robot fs-6"></i>
      </div>
      <p class="bubble-text">
        <strong>Need help?</strong> Ask MediMate for medicine advice, dosages, or orders!
      </p>
      <button class="bubble-close" id="btnDismissWelcomeBubble" title="Dismiss message" aria-label="Dismiss message">&times;</button>
    `;

    bubble.addEventListener('click', (e) => {
      if (e.target.closest('#btnDismissWelcomeBubble')) {
        e.stopPropagation();
        MediMateChatBot.dismissWelcomeBubble();
        return;
      }
      MediMateChatBot.dismissWelcomeBubble();
      if (!MediMateChatBot.isOpen) {
        MediMateChatBot.toggleChat();
      }
    });

    document.body.appendChild(bubble);
  },

  dismissWelcomeBubble: () => {
    sessionStorage.setItem('medimate_welcome_dismissed', 'true');
    const bubble = document.getElementById('medimateWelcomeBubble');
    if (bubble) {
      bubble.style.opacity = '0';
      bubble.style.transform = 'translateY(12px) scale(0.92)';
      setTimeout(() => bubble.remove(), 250);
    }
  },

  /**
   * Attach all DOM and interaction listeners
   */
  attachEventListeners: () => {
    const fab = document.getElementById('medimateFab');
    const closeBtn = document.getElementById('medimateCloseBtn');
    const clearBtn = document.getElementById('medimateClearBtn');
    const form = document.getElementById('medimateForm');
    const input = document.getElementById('medimateInput');

    // Toggle Chat Window
    const toggleChat = () => {
      MediMateChatBot.isOpen = !MediMateChatBot.isOpen;
      const windowEl = document.getElementById('medimateWindow');
      if (windowEl) {
        if (MediMateChatBot.isOpen) {
          // Open dialog: make interactive and accessible
          windowEl.removeAttribute('inert');
          windowEl.classList.add('active', 'show');
          windowEl.setAttribute('aria-hidden', 'false');
          MediMateChatBot.dismissWelcomeBubble();
          if (input) setTimeout(() => input.focus(), 150);
        } else {
          // Close dialog: safely blur descendant before hiding to comply with WAI-ARIA
          if (document.activeElement && windowEl.contains(document.activeElement)) {
            document.activeElement.blur();
          }
          windowEl.classList.remove('active', 'show');
          windowEl.setAttribute('aria-hidden', 'true');
          windowEl.setAttribute('inert', '');
          // Return focus to opening button per accessibility standards
          if (fab) fab.focus();
        }
      }
    };
    MediMateChatBot.toggleChat = toggleChat;

    if (fab) fab.addEventListener('click', toggleChat);
    if (closeBtn) closeBtn.addEventListener('click', toggleChat);

    // Close on Escape key press (W3C Dialog pattern)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && MediMateChatBot.isOpen) {
        toggleChat();
      }
    });

    // Clear Chat History
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        MediMateChatBot.history = [];
        const messages = document.getElementById('medimateMessages');
        if (messages) {
          messages.innerHTML = `
            <div class="chat-bubble chat-bubble-ai shadow-sm">
              <div class="fw-bold text-primary mb-1 d-flex align-items-center gap-1">
                <i class="bi bi-patch-check-fill text-primary"></i> KK PHARMACY Clinical AI Assistant
              </div>
              Chat history cleared. How can I assist you with your health or medicines today?
            </div>
          `;
          if (input) {
            input.disabled = false;
            input.placeholder = 'Ask about medicines, dosage, orders...';
          }
          const sendBtn = document.getElementById('medimateSendBtn');
          if (sendBtn) sendBtn.disabled = false;
        }
      });
    }

    // Attach suggested quick prompt buttons
    MediMateChatBot._attachQuickPromptListeners();

    // Submit user message
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = input ? input.value.trim() : '';
        if (!query || MediMateChatBot.isGenerating) return;

        input.value = '';
        await MediMateChatBot.handleUserMessage(query);
      });
    }
  },

  _attachQuickPromptListeners: () => {
    const quickButtons = document.querySelectorAll('.quick-prompt-btn');
    quickButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const promptText = e.currentTarget.getAttribute('data-prompt');
        if (promptText && !MediMateChatBot.isGenerating) {
          MediMateChatBot.handleUserMessage(promptText);
        }
      });
    });
  },

  /**
   * Process and send user query to secure backend proxy endpoint (/api/v1/chat)
   */
  handleUserMessage: async (userQuery) => {
    const messages = document.getElementById('medimateMessages');
    const input = document.getElementById('medimateInput');
    const sendBtn = document.getElementById('medimateSendBtn');

    // 1. Render User Bubble in UI
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user shadow-sm';
    userBubble.textContent = userQuery;
    messages.appendChild(userBubble);
    messages.scrollTop = messages.scrollHeight;

    // 2. Render Typing Indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-bubble chat-bubble-ai text-muted fst-italic shadow-sm';
    typingIndicator.id = 'medimateTyping';
    typingIndicator.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
        <span style="font-size: 0.8rem;">MediMate is consulting clinical database...</span>
      </div>
    `;
    messages.appendChild(typingIndicator);
    messages.scrollTop = messages.scrollHeight;

    MediMateChatBot.isGenerating = true;
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    try {
      // 3. Send query to Spring Boot Backend Proxy
      const apiBase = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) 
        ? CONFIG.API_BASE_URL 
        : 'http://localhost:8080/api/v1';

      // Format conversation memory
      const historyPayload = MediMateChatBot.history.slice(-6).map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        text: (h.parts && h.parts[0]) ? h.parts[0].text : ''
      }));

      const response = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: userQuery,
          history: historyPayload
        })
      });

      typingIndicator.remove();

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      // 4. Handle Service Unavailable state (No API key or service down)
      if (data.status === 'UNAVAILABLE' || !data.available) {
        const unavailBubble = document.createElement('div');
        unavailBubble.className = 'chat-bubble chat-bubble-ai border border-warning-subtle shadow-sm';
        unavailBubble.innerHTML = `
          <div class="text-warning-emphasis fw-bold mb-1">
            <i class="bi bi-exclamation-triangle-fill me-1"></i> AI Assistant Currently Unavailable
          </div>
          <p class="mb-2 small">${data.reply || 'MediMate AI Assistant is currently offline or undergoing scheduled maintenance.'}</p>
          <div class="small text-muted border-top pt-2">
            <i class="bi bi-telephone-fill text-primary me-1"></i> Pharmacist Hotline: <strong>+94 11 234 5678</strong><br>
            <i class="bi bi-envelope-fill text-primary me-1"></i> support@kkpharmacy.com
          </div>
        `;
        messages.appendChild(unavailBubble);
        messages.scrollTop = messages.scrollHeight;

        if (input) {
          input.disabled = true;
          input.placeholder = 'AI Assistant is currently offline';
        }
        if (sendBtn) sendBtn.disabled = true;
        return;
      }

      // 5. Successful AI Response
      const aiBubble = document.createElement('div');
      aiBubble.className = 'chat-bubble chat-bubble-ai shadow-sm';
      aiBubble.innerHTML = MediMateChatBot.formatMarkdown(data.reply);
      messages.appendChild(aiBubble);
      messages.scrollTop = messages.scrollHeight;

      // 6. Update Conversation Memory
      MediMateChatBot.updateHistory('user', userQuery);
      MediMateChatBot.updateHistory('model', data.reply);

      // 7. Re-enable input and send button for continuous chatting
      if (input) {
        input.disabled = false;
        input.placeholder = 'Ask about medicines, dosage, orders...';
      }
      if (sendBtn) {
        sendBtn.disabled = false;
      }

    } catch (error) {
      console.warn('[MediMate] Backend chat error:', error.message);
      if (typingIndicator.parentNode) typingIndicator.remove();

      // Transparent Unavailable Notice (NO FAKE MOCK FALLBACK)
      const errorBubble = document.createElement('div');
      errorBubble.className = 'chat-bubble chat-bubble-ai border border-danger-subtle shadow-sm';
      errorBubble.innerHTML = `
        <div class="text-danger fw-bold mb-1">
          <i class="bi bi-shield-x me-1"></i> MediMate AI Currently Unavailable
        </div>
        <p class="mb-2 small">
          Unable to connect to the KK Pharmacy AI services right now. 
          For immediate prescription verification, medicine availability, or urgent consultation, please contact our registered pharmacists directly.
        </p>
        <div class="small text-muted border-top pt-2">
          <i class="bi bi-telephone-fill text-primary me-1"></i> Hotline: <strong>+94 11 234 5678</strong> (8:00 AM – 10:00 PM)
        </div>
      `;
      messages.appendChild(errorBubble);
      messages.scrollTop = messages.scrollHeight;

      // Allow user to try again
      if (input) {
        input.disabled = false;
        input.placeholder = 'Type your question to try again...';
      }
      if (sendBtn) sendBtn.disabled = false;

    } finally {
      MediMateChatBot.isGenerating = false;
      if (input && !input.disabled) {
        setTimeout(() => input.focus(), 80);
      }
    }
  },

  /**
   * Maintain conversation memory cap
   */
  updateHistory: (role, text) => {
    MediMateChatBot.history.push({
      role: role === 'user' ? 'user' : 'model',
      parts: [{ text: text }]
    });

    if (MediMateChatBot.history.length > 6) {
      MediMateChatBot.history = MediMateChatBot.history.slice(-6);
    }
  },

  /**
   * Helper to format markdown bold, lists, and links into clean HTML
   */
  formatMarkdown: (text) => {
    if (!text) return '';
    
    const isSubdir = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
    const fixLink = (url) => {
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      if (isSubdir) {
        return url.replace(/^pages\//, '');
      }
      return url;
    };

    let html = text
      // Convert Markdown Links [Title](URL) -> <a href="...">Title</a>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, title, url) => {
        return `<a href="${fixLink(url)}" class="btn btn-sm btn-outline-primary py-0 px-2 my-1 d-inline-block text-decoration-none" style="font-size: 0.75rem;">${title} <i class="bi bi-box-arrow-up-right ms-1"></i></a>`;
      })
      // Convert Bold **text** -> <strong>text</strong>
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Convert Italic *text* -> <em>text</em>
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Convert Bullet points * item or - item -> <li>
      .replace(/^\s*[\*\-]\s+(.*)$/gm, '<li>$1</li>')
      // Convert Numbered lists 1. item -> <li>
      .replace(/^\s*\d+\.\s+(.*)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> into <ul>
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="mb-1 ps-3 mt-1 small">$1</ul>');
    // Remove duplicate nested <ul> tags
    html = html.replace(/<\/ul>\s*<ul class="mb-1 ps-3 mt-1 small">/g, '');

    // Convert newlines to <br>
    html = html.replace(/\n\n/g, '<div class="my-1"></div>').replace(/\n/g, '<br>');

    return html;
  }
};

// Expose globally for app initialization
window.MediMateChatBot = MediMateChatBot;
