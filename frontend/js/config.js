// API Configuration
// Automatically detect environment and use appropriate API URL
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
export const API_BASE_URL = isProduction
  ? "https://built-in-ai-challenge-api-436424395724.us-central1.run.app"
  : "http://localhost:8080";

// Constants
export const SUMMARY_DELAY = 5000; // Wait 5 seconds before generating summary
export const MIN_TEXT_LENGTH = 50; // Minimum text length for summary
