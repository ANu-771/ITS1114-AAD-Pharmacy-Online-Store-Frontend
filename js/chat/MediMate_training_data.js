/**
 * KK PHARMACY ONLINE PHARMACY — MEDIMATE AI CHATBOT SYSTEM CONFIGURATION
 * File: js/chat/MediMate_training_data.js
 * 
 * Secure Enterprise AI Architecture:
 * - Google Gemini API keys are maintained exclusively on the Spring Boot backend server.
 * - Client-side communications route securely through the Spring Boot proxy endpoint: POST /api/v1/chat.
 * - If the AI service is unconfigured or unavailable, the system transparently notifies the user and directs them to licensed pharmacy staff.
 */

const MEDIMATE_CONFIG = {
    botName: "MediMate",
    botTagline: "KK PHARMACY Healthcare & Clinical AI Assistant",
    botStatusText: "Online • Clinical & Store Advisor",
    welcomeMessage: `👋 Hello! I'm **MediMate**, your personal KK PHARMACY Healthcare & Pharmacy Assistant.

How can I help you today? You can ask me about:
* **Medicines & OTC Guidance** (Dosage, ingredients, usage)
* **Prescriptions** (How to upload & verify Rx orders)
* **Medical Equipment & Devices** (BP monitors, glucometers, nebulizers)
* **Orders, Islandwide Delivery & Free Shipping**
* **Vitamins & Baby Care Essentials**

*⚠️ Disclaimer: My advice is for informational guidance only. Always consult a qualified physician for medical emergencies.*`
};

window.MEDIMATE_CONFIG = MEDIMATE_CONFIG;
