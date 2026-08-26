/**
 * BlogSphere - Authentication & Session Management Module
 * Handles token storage, user session, route protection, 401 expiration handling, and auth headers.
 */

const AUTH_STORAGE_KEY = 'blogSphere_currentUser';
const API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL) ? window.API_BASE_URL : '/api';

// ==========================================
// SESSION & TOKEN STORAGE
// ==========================================

/**
 * Save user authentication session
 * @param {string} token - JWT Token
 * @param {object} user - User object { id, name, email }
 */
function setAuthSession(token, user) {
  const sessionData = {
    token,
    user: {
      id: user.id || user._id,
      _id: user.id || user._id,
      name: user.name,
      email: user.email
    },
    // Also include top-level properties for backward compatibility
    _id: user.id || user._id,
    id: user.id || user._id,
    name: user.name,
    email: user.email
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
}

/**
 * Retrieve current auth session
 * @returns {object|null}
 */
function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error reading auth session:', e);
    return null;
  }
}

/**
 * Retrieve the active JWT token
 * @returns {string|null}
 */
function getToken() {
  const session = getAuthSession();
  return session ? session.token : null;
}

/**
 * Retrieve current user information (never includes passwords)
 * @returns {object|null}
 */
function getCurrentUser() {
  const session = getAuthSession();
  if (!session) return null;
  return session.user || {
    id: session._id || session.id,
    _id: session._id || session.id,
    name: session.name,
    email: session.email
  };
}

/**
 * Check if the user is currently authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!getToken() && !!getCurrentUser();
}

/**
 * Clear authentication session from storage
 */
function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// ==========================================
// ROUTE GUARDS & REDIRECTS
// ==========================================

/**
 * Require authentication for private pages (Dashboard, Create, Edit, Profile)
 * Redirects to login.html if unauthenticated.
 */
function requireAuth() {
  if (!isAuthenticated()) {
    sessionStorage.setItem('auth_redirect_message', 'Please log in to access this page.');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * Redirect already authenticated users away from Login/Register pages
 */
function redirectIfAuth() {
  if (isAuthenticated()) {
    window.location.href = 'dashboard.html';
    return true;
  }
  return false;
}

/**
 * Handle expired or invalid session (HTTP 401)
 */
function handleSessionExpired() {
  clearAuthSession();
  sessionStorage.setItem('session_message', 'Your session has expired. Please log in again.');
  window.location.href = 'login.html';
}

/**
 * User Logout
 */
function logout() {
  clearAuthSession();
  if (typeof showToast === 'function') {
    showToast('Logged out successfully!', 'success');
  }
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// ==========================================
// AUTHENTICATED FETCH WRAPPER
// ==========================================

/**
 * Helper to make API requests with automatic Authorization header and 401 handling
 * @param {string} url - API Endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token is invalid or expired
      handleSessionExpired();
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  } catch (error) {
    throw error;
  }
}

// ==========================================
// DEMO USERS STORAGE FOR STATIC HOSTS
const DEMO_USERS_KEY = 'blogSphere_demo_users';
function getDemoUsers() {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults = [
    { _id: 'user_aashutosh_id', id: 'user_aashutosh_id', name: 'Aashutosh Raushan', email: 'aashutosh@example.com', password: 'password123', createdAt: '2026-01-15T10:00:00.000Z' },
    { _id: 'user_tech_id', id: 'user_tech_id', name: 'Tech Enthusiast', email: 'tech@example.com', password: 'password123', createdAt: '2026-02-01T12:00:00.000Z' }
  ];
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(defaults));
  return defaults;
}

/**
 * Login user via backend API (with static fallback)
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, message?: string, data?: object}>}
 */
async function apiLogin(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data && data.data.token) {
        setAuthSession(data.data.token, data.data.user || data.data);
      }
      return data;
    } else if (res.status === 400 || res.status === 401) {
      return await res.json();
    }
  } catch (error) {
    // Fallback for static hosting (GitHub Pages without running backend)
  }

  // Client-side fallback authentication
  const users = getDemoUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
  if (found) {
    const fakeToken = 'demo_jwt_token_' + Date.now();
    setAuthSession(fakeToken, found);
    return { success: true, message: 'Login successful (Demo Mode)', data: { token: fakeToken, user: found } };
  }
  return { success: false, message: 'Invalid email or password' };
}

/**
 * Register user via backend API (with static fallback)
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, message?: string, data?: object}>}
 */
async function apiRegister(name, email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    if (res.ok || res.status === 400) {
      return await res.json();
    }
  } catch (error) {
    // Fallback for static hosting
  }

  // Client-side fallback registration
  const users = getDemoUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
    return { success: false, message: 'User already exists with this email' };
  }

  const newUser = {
    _id: 'user_' + Date.now(),
    id: 'user_' + Date.now(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  return { success: true, message: 'Registration successful', data: { user: newUser } };
}

/**
 * Fetch authenticated user profile from GET /api/auth/me (with static fallback)
 * @returns {Promise<object|null>}
 */
async function apiGetMe() {
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/auth/me`);
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : null;
    }
  } catch (error) {
    // Fallback for static hosting
  }

  const currentUser = getCurrentUser();
  if (currentUser) {
    const users = getDemoUsers();
    const userDetails = users.find(u => u.email.toLowerCase() === (currentUser.email || '').toLowerCase()) || currentUser;
    return {
      _id: userDetails._id || userDetails.id,
      id: userDetails._id || userDetails.id,
      name: userDetails.name,
      email: userDetails.email,
      createdAt: userDetails.createdAt || '2026-01-15T10:00:00.000Z'
    };
  }
  return null;
}

// ==========================================
// NAVIGATION AUTH STATE
// ==========================================

/**
 * Dynamically update navigation bar links based on current authentication state
 */
function updateNavigation() {
  const authenticated = isAuthenticated();
  const guestLinks = document.querySelectorAll('.guest-link');
  const authLinks = document.querySelectorAll('.auth-link');

  if (authenticated) {
    guestLinks.forEach(link => link.style.display = 'none');
    authLinks.forEach(link => link.style.display = '');
  } else {
    guestLinks.forEach(link => link.style.display = '');
    authLinks.forEach(link => link.style.display = 'none');
  }

  // Attach logout handler to all logout buttons
  document.querySelectorAll('#logoutBtn, .logout-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      logout();
    };
  });
}

// Initialize navigation on script load or DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateNavigation);
} else {
  updateNavigation();
}
