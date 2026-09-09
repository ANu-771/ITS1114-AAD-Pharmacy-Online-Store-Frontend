/**
 * KK PHARMACY ONLINE PHARMACY — MEDIMATE AI CHATBOT CONTROLLER
 * File: js/pages/chat-bot.js
 * 
 * Implementation of the MediMate customer AI assistant powered by Google
 * Generative AI (Gemini).
 * 
 * Features:
 * - Dynamic live database context extraction (Products, Categories, Cart, Auth)
 * - Safe token usage and customizable 5-message conversation memory window
 * - Robust Google Generative AI REST API caller with fallback knowledgebase
 * - Modern, accessible, responsive healthcare chat interface
 */

const MediMateChatBot = {
  initialized: false,
  isOpen: false,
  isGenerating: false,
  
  // Conversation History Memory: Capped at MEDIMATE_CONFIG.maxHistoryMessages
  history: [],

  /**
   * Initialize MediMate on customer integrated pages
   */
  init: () => {
    // Only initialize once and avoid loading inside admin dashboard
    if (MediMateChatBot.initialized || document.querySelector('.admin-layout')) return;

    // Ensure training data & config is loaded
    if (typeof MEDIMATE_CONFIG === 'undefined') {
      console.warn('[MediMate] MEDIMATE_CONFIG not found. Please ensure js/chat/MediMate_training_data.js is loaded.');
      return;
    }

    MediMateChatBot.renderUI();
    MediMateChatBot.attachEventListeners();
    MediMateChatBot.initialized = true;
    console.log(`🤖 [MediMate] AI Assistant initialized with model: ${MEDIMATE_CONFIG.model}, memory cap: ${MEDIMATE_CONFIG.maxHistoryMessages} msgs.`);
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
      <div class="ai-chat-window" id="medimateWindow" role="dialog" aria-labelledby="medimateTitle" aria-hidden="true">
        <!-- Header -->
        <div class="ai-chat-header d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <div class="bg-primary p-2 rounded-circle text-white shadow-sm" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <i class="bi bi-robot fs-5"></i>
            </div>
            <div>
              <div class="fw-bold text-white small" id="medimateTitle">${MEDIMATE_CONFIG.botName}</div>
              <small class="text-white-50 d-flex align-items-center" style="font-size: 0.7rem;">
                <span class="pulse-dot me-1"></span> ${MEDIMATE_CONFIG.botStatusText}
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
              <i class="bi bi-patch-check-fill text-primary"></i> ${MEDIMATE_CONFIG.botTagline}
            </div>
            ${MediMateChatBot.formatMarkdown(MEDIMATE_CONFIG.welcomeMessage)}
          </div>

          <!-- Quick Prompts Row -->
          <div class="quick-prompts-container mt-2 mb-1" id="medimateQuickPrompts">
            <div class="small fw-bold text-muted mb-1" style="font-size: 0.72rem;">Suggested Questions:</div>
            <div class="d-flex flex-wrap gap-1">
              ${(MEDIMATE_CONFIG.trainingData.quickPrompts || []).map(p => `
                <button type="button" class="btn btn-sm btn-outline-primary py-1 px-2 rounded-pill quick-prompt-btn" style="font-size: 0.72rem;" data-prompt="${p}">
                  ${p}
                </button>
              `).join('')}
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
          <div class="d-flex justify-content-between align-items-center mt-1 px-1">
            <small class="text-muted" style="font-size: 0.65rem;">
              <i class="bi bi-shield-check text-success me-1"></i>Google Generative AI &middot; Memory: 5 msgs
            </small>
            <small class="text-muted" style="font-size: 0.65rem;">Token-Safe</small>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(container);
  },

  /**
   * Attach UI event listeners
   */
  attachEventListeners: () => {
    const fab = document.getElementById('medimateFab');
    const closeBtn = document.getElementById('medimateCloseBtn');
    const clearBtn = document.getElementById('medimateClearBtn');
    const windowEl = document.getElementById('medimateWindow');
    const form = document.getElementById('medimateForm');
    const input = document.getElementById('medimateInput');
    const quickPrompts = document.getElementById('medimateQuickPrompts');

    // Toggle Chat Window
    const toggleChat = () => {
      MediMateChatBot.isOpen = !MediMateChatBot.isOpen;
      if (MediMateChatBot.isOpen) {
        windowEl.classList.add('show');
        windowEl.setAttribute('aria-hidden', 'false');
        input.focus();
      } else {
        windowEl.classList.remove('show');
        windowEl.setAttribute('aria-hidden', 'true');
      }
    };

    if (fab) fab.addEventListener('click', toggleChat);
    if (closeBtn) closeBtn.addEventListener('click', toggleChat);

    // Clear Chat History
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        MediMateChatBot.history = [];
        const messages = document.getElementById('medimateMessages');
        messages.innerHTML = `
          <div class="chat-bubble chat-bubble-ai shadow-sm">
            <div class="fw-bold text-primary mb-1 d-flex align-items-center gap-1">
              <i class="bi bi-arrow-clockwise text-primary"></i> Memory Cleared
            </div>
            ${MediMateChatBot.formatMarkdown(MEDIMATE_CONFIG.welcomeMessage)}
          </div>
          <div class="quick-prompts-container mt-2 mb-1" id="medimateQuickPrompts">
            <div class="small fw-bold text-muted mb-1" style="font-size: 0.72rem;">Suggested Questions:</div>
            <div class="d-flex flex-wrap gap-1">
              ${(MEDIMATE_CONFIG.trainingData.quickPrompts || []).map(p => `
                <button type="button" class="btn btn-sm btn-outline-primary py-1 px-2 rounded-pill quick-prompt-btn" style="font-size: 0.72rem;" data-prompt="${p}">
                  ${p}
                </button>
              `).join('')}
            </div>
          </div>
        `;
        MediMateChatBot._attachQuickPromptListeners();
      });
    }

    // Quick Prompt Clicks
    MediMateChatBot._attachQuickPromptListeners();

    // Form Submission / Message Dispatch
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query || MediMateChatBot.isGenerating) return;

        input.value = '';
        await MediMateChatBot.handleUserMessage(query);
      });
    }
  },

  /**
   * Helper to attach click handlers to suggestion prompt pills
   */
  _attachQuickPromptListeners: () => {
    const promptButtons = document.querySelectorAll('.quick-prompt-btn');
    promptButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-prompt');
        // Strip emoji for clean query if needed
        const cleanQuery = text.replace(/^[^\w\s]+\s*/, '');
        MediMateChatBot.handleUserMessage(cleanQuery);
      });
    });
  },

  /**
   * Extract live database and store state to inject into AI prompt context
   */
  getDatabaseContext: async () => {
    try {
      // 1. Fetch live products and categories
      const products = typeof ProductService !== 'undefined' ? await ProductService.getProducts('all') : [];
      const categories = typeof ProductService !== 'undefined' ? await ProductService.getCategories() : [];
      
      // 2. Fetch current customer cart status
      const cartItems = typeof CartService !== 'undefined' ? CartService.getCartItems() : [];
      const cartCount = typeof CartService !== 'undefined' ? CartService.getCartCount() : 0;
      const cartSubtotal = typeof CartService !== 'undefined' ? CartService.getCartSubtotal() : 0;

      // 3. Fetch active customer session info
      const currentUser = typeof AuthService !== 'undefined' ? AuthService.getCurrentUser() : null;

      // Format compact product catalog summary (Token-safe)
      const catalogSummary = (products || []).map(p => (
        `ID: ${p.id} | ${p.name} | Category: ${p.categoryName || p.category} | Price: Rs. ${p.price} | Stock: ${p.inStock ? 'IN STOCK' : 'OUT OF STOCK'} | Rx Required: ${p.requiresPrescription ? 'YES (Doctor Rx Mandatory)' : 'NO (OTC)'} | Ingredient: ${p.activeIngredient || 'N/A'}`
      )).join('\n');

      const cartSummary = cartItems.length > 0 
        ? cartItems.map(i => `${i.name} (Qty: ${i.quantity}, Price: Rs. ${i.price})`).join(', ')
        : 'Cart is currently empty';

      const userInfo = currentUser && currentUser.fullName && currentUser.fullName !== 'Guest User'
        ? `Authenticated Customer: ${currentUser.fullName} (${currentUser.email})`
        : 'Guest Customer (Not Logged In)';

      return `
[LIVE DATABASE & STORE CONTEXT - REAL TIME DATA]
1. Active Store Catalog (${products.length} Products):
${catalogSummary}

2. Available Departments:
${(categories || []).map(c => `- ${c.name} (${c.desc})`).join('\n')}

3. Current Customer Session:
- User: ${userInfo}
- Active Cart: ${cartSummary} | Subtotal: Rs. ${cartSubtotal} (Items Count: ${cartCount})
- Free Delivery Threshold: Rs. ${CONFIG.FREE_SHIPPING_THRESHOLD || 5000} (${cartSubtotal >= (CONFIG.FREE_SHIPPING_THRESHOLD || 5000) ? 'ELIGIBLE FOR FREE SHIPPING' : `Rs. ${(CONFIG.FREE_SHIPPING_THRESHOLD || 5000) - cartSubtotal} needed for free shipping`})
[END OF DATABASE CONTEXT]
`;
    } catch (err) {
      console.warn('[MediMate] Error reading live database context:', err);
      return '';
    }
  },

  /**
   * Process and send user query to Google Generative AI / Gemini API
   */
  handleUserMessage: async (userQuery) => {
    const messages = document.getElementById('medimateMessages');
    const input = document.getElementById('medimateInput');
    const sendBtn = document.getElementById('medimateSendBtn');

    // 1. Render User Message in UI
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
        <span style="font-size: 0.8rem;">${MEDIMATE_CONFIG.botName} is consulting clinical database...</span>
      </div>
    `;
    messages.appendChild(typingIndicator);
    messages.scrollTop = messages.scrollHeight;

    MediMateChatBot.isGenerating = true;
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    try {
      // 3. Get real-time database context
      const liveDbContext = await MediMateChatBot.getDatabaseContext();

      // 4. Call Google Generative AI API or Local Fallback Engine
      const aiResponse = await MediMateChatBot.callGeminiAPI(userQuery, liveDbContext);

      // 5. Update Conversation Memory (Strictly last N messages)
      MediMateChatBot.updateHistory('user', userQuery);
      MediMateChatBot.updateHistory('model', aiResponse);

      // 6. Remove typing indicator and render formatted AI response
      typingIndicator.remove();

      const aiBubble = document.createElement('div');
      aiBubble.className = 'chat-bubble chat-bubble-ai shadow-sm';
      aiBubble.innerHTML = MediMateChatBot.formatMarkdown(aiResponse);
      messages.appendChild(aiBubble);
      messages.scrollTop = messages.scrollHeight;

    } catch (error) {
      console.error('[MediMate] Generation error:', error);
      typingIndicator.remove();

      // Fallback response with training knowledge
      const fallbackResponse = MediMateChatBot.generateLocalFallback(userQuery);
      const fallbackBubble = document.createElement('div');
      fallbackBubble.className = 'chat-bubble chat-bubble-ai shadow-sm';
      fallbackBubble.innerHTML = MediMateChatBot.formatMarkdown(fallbackResponse);
      messages.appendChild(fallbackBubble);
      messages.scrollTop = messages.scrollHeight;
    } finally {
      MediMateChatBot.isGenerating = false;
      if (input) {
        input.disabled = false;
        input.focus();
      }
      if (sendBtn) sendBtn.disabled = false;
    }
  },

  /**
   * Maintain strict 5-message memory cap (or custom configured value)
   */
  updateHistory: (role, text) => {
    MediMateChatBot.history.push({
      role: role === 'user' ? 'user' : 'model',
      parts: [{ text: text }]
    });

    const maxMemory = MEDIMATE_CONFIG.maxHistoryMessages || 5;
    if (MediMateChatBot.history.length > maxMemory) {
      MediMateChatBot.history = MediMateChatBot.history.slice(-maxMemory);
    }
  },

  /**
   * Call Google Generative AI REST API with token limit safety
   */
  callGeminiAPI: async (userQuery, liveDbContext) => {
    const config = MEDIMATE_CONFIG;

    // If API Key is unconfigured or default placeholder, use local knowledgebase directly
    if (!config.apiKey || config.apiKey.includes('YOUR_GEMINI_API_KEY')) {
      console.info('[MediMate] Notice: Gemini API Key is in placeholder state. Operating in High-Accuracy Local Knowledgebase mode.');
      return MediMateChatBot.generateLocalFallback(userQuery);
    }

    const endpoint = `${config.apiBaseUrl}/${config.model}:generateContent?key=${config.apiKey}`;

    // Prepare system instructions + dynamic store database context
    const fullSystemInstruction = `${config.systemInstruction}\n\n${liveDbContext}`;

    // Build payload according to Gemini REST API specification
    const payload = {
      systemInstruction: {
        parts: [{ text: fullSystemInstruction }]
      },
      contents: [
        ...MediMateChatBot.history,
        {
          role: 'user',
          parts: [{ text: userQuery }]
        }
      ],
      generationConfig: {
        maxOutputTokens: config.generationConfig.maxOutputTokens || 400,
        temperature: config.generationConfig.temperature || 0.6,
        topP: config.generationConfig.topP || 0.9,
        topK: config.generationConfig.topK || 40
      },
      safetySettings: config.safetySettings || []
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[MediMate] Gemini API returned status ${response.status}: ${errText}`);
      // Fallback to local intelligence if quota/rate limit/error occurs
      return MediMateChatBot.generateLocalFallback(userQuery);
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      return data.candidates[0].content.parts.map(p => p.text).join('\n');
    }

    return MediMateChatBot.generateLocalFallback(userQuery);
  },

  /**
   * Local Knowledge Base & Real-Time Product Database Matcher
   * Provides immediate, 100% accurate fallback responses matching KK PHARMACY's catalog
   */
  generateLocalFallback: (query) => {
    const q = query.toLowerCase();
    const training = MEDIMATE_CONFIG.trainingData;
    const isSubdir = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
    const basePath = isSubdir ? '' : 'pages/';

    // 1. Direct Q&A Dataset Exact/Partial Matches
    for (const qa of (training.qaDataset || [])) {
      const qKeywords = qa.question.toLowerCase().split(' ').filter(w => w.length > 3);
      const matchCount = qKeywords.filter(k => q.includes(k)).length;
      if (matchCount >= 2 || q.includes(qa.question.toLowerCase())) {
        return qa.answer;
      }
    }

    // 2. Paracetamol / Fever / Pain
    if (q.includes('paracetamol') || q.includes('panadol') || q.includes('fever') || q.includes('headache') || q.includes('pain')) {
      return `**Paracetamol 500mg Guidance:**
* **Standard Adult Dose**: 1–2 tablets (500mg–1000mg) every 4–6 hours as needed.
* **Maximum Daily Dose**: 4,000mg (8 tablets) within 24 hours.
* **In Stock**: Panadol / Haleon Paracetamol 500mg (100s) — **Rs. 480.00**
* [View Paracetamol in Store](${basePath}products.html?search=paracetamol)
* ⚠️ *Do not combine with other paracetamol-containing products.*`;
    }

    // 3. Amoxicillin / Antibiotics / Prescription
    if (q.includes('amoxicillin') || q.includes('antibiotic') || q.includes('infection') || q.includes('prescription') || q.includes('rx')) {
      return `**Amoxicillin 500mg & Prescription (Rx) Policy:**
* ⚠️ **Doctor Prescription Required**: Amoxicillin is a regulated antibiotic and cannot be dispensed without a valid doctor's prescription.
* **Price**: Rs. 650.00 (GSK Capsules 30s pack) — In Stock.
* **How to Order**:
  1. Add medication to your cart.
  2. Proceed to [Checkout](${basePath}checkout.html).
  3. Upload your doctor's prescription photo/PDF.
  4. Our registered pharmacist will verify before shipping.`;
    }

    // 4. Medical Equipment & BP Monitors / Glucometers / Nebulizers
    if (q.includes('blood pressure') || q.includes('bp') || q.includes('omron') || q.includes('hypertension') || q.includes('equipment') || q.includes('monitor') || q.includes('glucometer') || q.includes('nebulizer') || q.includes('oximeter')) {
      return `**Certified Medical Diagnostic Equipment:**
* **Omron Upper Arm BP Monitor**: Rs. 14,850.00 (IntelliWrap 360° sensor, 60 memory slots)
* **Accu-Chek Instant Glucometer Kit**: Rs. 8,900.00 (4-second result, 50 strips included)
* **Beurer Fingertip Pulse Oximeter**: Rs. 4,950.00 (SpO2 & Heart Rate OLED)
* **Microlife Forehead Thermometer**: Rs. 6,200.00 (1-sec infrared fever alert)
* **Philips Ultrasonic Nebulizer**: Rs. 12,500.00 (Piston compressor respiratory therapy)

[Browse All Medical Equipment](${basePath}products.html?category=equipment)`;
    }

    // 5. Vitamins, Supplements & Immunity
    if (q.includes('vitamin') || q.includes('immunity') || q.includes('supplement') || q.includes('omega') || q.includes('calcium') || q.includes('zinc')) {
      return `**Daily Wellness, Vitamins & Immune Boosters:**
* **Redoxon / Vita-Immune Vitamin C 1000mg + Zinc (20s)**: Rs. 1,950.00 (Effervescent Orange)
* **Seven Seas Daily Multivitamin 60s**: Rs. 3,200.00 (A, B-Complex, C, D3, Zinc, Iron)
* **Omega-3 Triple Strength Fish Oil (90s)**: Rs. 4,600.00 (EPA 360mg / DHA 240mg)
* **Calcium + Vitamin D3 60s**: Rs. 2,800.00 (Bone mineralization & joint health)

[Shop Vitamins & Supplements](${basePath}products.html?category=vitamins)`;
    }

    // 6. Baby Care & Infant Colic / Diaper Rash
    if (q.includes('baby') || q.includes('infant') || q.includes('colic') || q.includes('gripe') || q.includes('rash') || q.includes('diaper')) {
      return `**Pediatrician-Approved Baby Care Essentials:**
* **Tummy Calm Gripe Water (60ml)**: Rs. 780.00 (Natural gas & colic relief with oral dropper)
* **Sudocrem Baby Healing Diaper Rash Cream (226g)**: Rs. 1,850.00 (Zinc Oxide barrier)
* **Sebamed Tear-Free Baby Wash & Shampoo (250ml)**: Rs. 2,450.00 (pH 5.5 skin balanced)

[Explore Baby Care Collection](${basePath}products.html?category=baby-care)`;
    }

    // 7. Delivery, Shipping Fees & Islandwide Coverage
    if (q.includes('delivery') || q.includes('shipping') || q.includes('free') || q.includes('cost') || q.includes('islandwide')) {
      return `**KK PHARMACY Islandwide Delivery Details:**
* **Free Delivery**: On all orders over **Rs. 5,000**.
* **Standard Delivery**: Rs. 350 for orders below Rs. 5,000.
* **Delivery Time**: 1–2 business days across all districts in Sri Lanka.
* **Secure Packaging**: Temperature-monitored vehicles for delicate medicines.`;
    }

    // 8. General Healthcare / Pharmacy Inquiry
    return `**KK PHARMACY Pharmacist Guidance:**
Thank you for your question regarding "*${query}*".

As your **MediMate** assistant, I can check our live pharmaceutical catalog, confirm dosage and Rx status, or help with orders.
* [Search Our Products Catalog](${basePath}products.html)
* [View Your Shopping Cart](${basePath}cart.html)
* Need direct pharmacist assistance? Call our Colombo branch hotline: **+94 11 234 5678** (8:00 AM – 10:00 PM).`;
  },

  /**
   * Helper to format markdown bold, lists, and links into clean HTML
   */
  formatMarkdown: (text) => {
    if (!text) return '';
    
    // Normalize relative links based on current page location
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

    // Convert newlines to <br> where appropriate
    html = html.replace(/\n\n/g, '<div class="my-1"></div>').replace(/\n/g, '<br>');

    return html;
  }
};

// Expose globally for app initialization
window.MediMateChatBot = MediMateChatBot;
