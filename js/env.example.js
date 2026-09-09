/**
 * KK PHARMACY - ENVIRONMENT CONFIGURATION TEMPLATE
 * File: js/env.example.js
 * 
 * INSTRUCTIONS:
 * 1. Copy this file and rename it to 'env.js' inside the 'js/' folder:
 *    cp js/env.example.js js/env.js
 * 2. Replace 'YOUR_GEMINI_API_KEY_HERE' with your real Google Gemini API Key.
 * 3. The 'env.js' file is already added to .gitignore and will NEVER be committed.
 */

window.ENV = {
  // Google Gemini API Key for MediMate AI Chatbot
  // Obtain free key from: https://aistudio.google.com/app/apikey
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',

  // Optional backend API endpoint override (defaults to CONFIG.API_BASE_URL)
  API_BASE_URL: 'http://localhost:8080/api/v1'
};
