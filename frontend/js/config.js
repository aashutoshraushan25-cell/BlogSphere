/**
 * BlogSphere - Frontend Configuration Module
 * Automatically resolves the Backend API URL based on the runtime environment
 * (Local Development vs Production Deployment).
 */

const CONFIG = {
  // Set your deployed backend URL here if hosting frontend and backend on different domains
  // Example: 'https://blogsphere-backend.onrender.com/api'
  PROD_API_URL: 'https://blogsphere-api-production.up.railway.app/api',

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
      // If running on a different port than 5000 (e.g., Live Server on 5500), target backend at port 5000
      if (window.location.port && window.location.port !== '5000' && window.location.port !== '') {
        return `${protocol === 'file:' ? 'http:' : protocol}//${hostname || 'localhost'}:5000/api`;
      }
      return '/api';
    }

    // 3. GitHub Pages or External Static Host detection
    if (hostname.includes('github.io') || hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      // In production static hosting, use configured PROD_API_URL or fallback to relative /api
      return this.PROD_API_URL || '/api';
    }

    // 4. Default relative API path (when served directly from the Node/Express backend in production)
    return '/api';
  }
};

// Global API Base URL definition
window.API_BASE_URL = CONFIG.getApiBaseUrl();
