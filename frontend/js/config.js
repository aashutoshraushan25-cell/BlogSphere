/**
 * BlogSphere - Frontend Configuration Module
 * Automatically resolves the Backend API URL based on the runtime environment
 * (Local Development vs Production Deployment).
 */

const CONFIG = {
  // Set your deployed backend URL here if you have deployed the backend to Render / Railway / Heroku
  // Example: 'https://blogsphere-backend.onrender.com/api'
  PROD_API_URL: '',

  // Fallback to relative /api when served from Express or on localhost
  getApiBaseUrl() {
    // 1. Explicit override via window
    if (window.CUSTOM_API_URL) {
      return window.CUSTOM_API_URL;
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // 2. Local development detection (Express backend or Live Server on localhost / 127.0.0.1)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || protocol === 'file:') {
      if (window.location.port && window.location.port !== '5000' && window.location.port !== '') {
        return `${protocol === 'file:' ? 'http:' : protocol}//${hostname || 'localhost'}:5000/api`;
      }
      return '/api';
    }

    // 3. GitHub Pages or External Static Host detection
    if (hostname.includes('github.io') || hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      return this.PROD_API_URL || '';
    }

    // 4. Default relative API path (when served directly from the Node/Express backend)
    return '/api';
  }
};

// Global API Base URL definition
window.API_BASE_URL = CONFIG.getApiBaseUrl();

