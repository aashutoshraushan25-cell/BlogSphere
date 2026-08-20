/**
 * BlogSphere - Main JavaScript Application (Backend Connected)
 * Handles Auth, CRUD operations via REST API, and UI interactivity
 */

const API_URL = '/api';

// DOM Elements & Setup
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// App Initialization
function initApp() {
  updateNavigation();
  setupMobileMenu();
  setupPasswordToggles();
  
  // Page Specific Logic
  const path = window.location.pathname;
  if (path.includes('index.html') || path.endsWith('/')) {
    renderHomeBlogs();
  } else if (path.includes('dashboard.html')) {
    requireAuth();
    renderDashboard();
  } else if (path.includes('create-blog.html')) {
    requireAuth();
    setupCreateBlogForm();
  } else if (path.includes('blog-details.html')) {
    renderBlogDetails();
  } else if (path.includes('profile.html')) {
    requireAuth();
    renderProfile();
  } else if (path.includes('login.html')) {
    redirectIfAuth();
    setupLoginForm();
  } else if (path.includes('register.html')) {
    redirectIfAuth();
    setupRegisterForm();
  }

  // Handle Logout buttons globally
  document.querySelectorAll('#logoutBtn, .logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
}

// ==========================================
// AUTHENTICATION LOGIC (API)
// ==========================================

// Register a new user
async function register(name, email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem('blogSphere_currentUser', JSON.stringify(data.data));
      return true;
    } else {
      showToast(data.message, 'error');
      return false;
    }
  } catch (error) {
    showToast('Registration failed', 'error');
    return false;
  }
}

// Login an existing user
async function login(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem('blogSphere_currentUser', JSON.stringify(data.data));
      return true;
    } else {
      showToast(data.message, 'error');
      return false;
    }
  } catch (error) {
    showToast('Login failed', 'error');
    return false;
  }
}

// Logout user
function logout() {
  localStorage.removeItem('blogSphere_currentUser');
  showToast('Logged out successfully!', 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Get current logged in user
function getCurrentUser() {
  const user = localStorage.getItem('blogSphere_currentUser');
  return user ? JSON.parse(user) : null;
}

// Route Protection
function requireAuth() {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
  }
}

function redirectIfAuth() {
  if (getCurrentUser()) {
    window.location.href = 'dashboard.html';
  }
}

// Update navbar links
function updateNavigation() {
  const user = getCurrentUser();
  const guestLinks = document.querySelectorAll('.guest-link');
  const authLinks = document.querySelectorAll('.auth-link');
  
  if (user) {
    guestLinks.forEach(link => link.style.display = 'none');
    authLinks.forEach(link => link.style.display = 'block');
  } else {
    guestLinks.forEach(link => link.style.display = 'block');
    authLinks.forEach(link => link.style.display = 'none');
  }
}

// ==========================================
// BLOG API LOGIC
// ==========================================

async function fetchUserProfile() {
  const user = getCurrentUser();
  if (!user || !user.token) return null;
  
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

async function fetchBlogs(options = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (options.search) queryParams.append('search', options.search);
    if (options.category) queryParams.append('category', options.category);
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.author) queryParams.append('author', options.author);

    const res = await fetch(`${API_URL}/blogs?${queryParams.toString()}`);
    const data = await res.json();
    return data.success ? data : { data: [], pagination: null };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return { data: [], pagination: null };
  }
}

async function fetchBlog(id) {
  try {
    const res = await fetch(`${API_URL}/blogs/${id}`);
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

async function apiUpdateBlog(id, blogData) {
  const user = getCurrentUser();
  if (!user || !user.token) return false;
  
  try {
    const res = await fetch(`${API_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(blogData)
    });
    const data = await res.json();
    
    if (!data.success) showToast(data.message, 'error');
    return data.success;
  } catch (error) {
    showToast('Failed to update blog', 'error');
    return false;
  }
}

async function apiCreateBlog(blogData) {
  const user = getCurrentUser();
  if (!user || !user.token) return false;
  
  try {
    const res = await fetch(`${API_URL}/blogs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(blogData)
    });
    const data = await res.json();
    
    if (!data.success) showToast(data.message, 'error');
    return data.success;
  } catch (error) {
    showToast('Failed to create blog', 'error');
    return false;
  }
}

async function apiDeleteBlog(id) {
  const user = getCurrentUser();
  if (!user || !user.token) return false;
  
  try {
    const res = await fetch(`${API_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${user.token}`
      }
    });
    const data = await res.json();
    if (!data.success) showToast(data.message, 'error');
    return data.success;
  } catch (error) {
    showToast('Failed to delete blog', 'error');
    return false;
  }
}

// ==========================================
// UI & FORM LOGIC
// ==========================================

// Setup Login Form
function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const success = await login(email, password);
    if (success) {
      showToast('Login successful!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    }
  });
}

// Setup Register Form
function setupRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    const success = await register(name, email, password);
    if (success) {
      showToast('Registration successful!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    }
  });
}

// Setup Create Blog Form
async function setupCreateBlogForm() {
  const form = document.getElementById('createBlogForm');
  const contentInput = document.getElementById('content');
  const charCounter = document.getElementById('charCounter');
  const formTitle = document.querySelector('.auth-container h2');
  const submitBtn = document.querySelector('#createBlogForm button[type="submit"]');
  
  if (!form) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  
  if (editId) {
    if (formTitle) formTitle.textContent = 'Edit Blog';
    if (submitBtn) submitBtn.textContent = 'Update Blog';
    
    const blog = await fetchBlog(editId);
    if (blog) {
      document.getElementById('title').value = blog.title;
      document.getElementById('category').value = blog.category;
      contentInput.value = blog.content;
      if (document.getElementById('image') && blog.image) {
        document.getElementById('image').value = blog.image;
      }
      const wordCount = blog.content.trim() === '' ? 0 : blog.content.trim().split(/\s+/).length;
      charCounter.textContent = `${wordCount} words | ${blog.content.length} characters`;
    }
  }
  
  contentInput.addEventListener('input', () => {
    const text = contentInput.value;
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    charCounter.textContent = `${wordCount} words | ${charCount} characters`;
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const content = contentInput.value.trim();
    const imageInput = document.getElementById('image');
    const image = imageInput ? imageInput.value.trim() : '';
    
    if (title.length < 5 || content.length < 50) {
      showToast('Title must be 5+ chars and content 50+ chars', 'error');
      return;
    }
    
    let success;
    if (editId) {
      success = await apiUpdateBlog(editId, { title, category, content, image });
    } else {
      success = await apiCreateBlog({ title, category, content, image });
    }
    
    if (success) {
      showToast(editId ? 'Blog updated successfully!' : 'Blog published successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    }
  });
}

// Globals for Pagination and Filters
let currentPage = 1;
let currentSearch = '';
let currentCategory = '';

// Render Blogs on Home Page
async function renderHomeBlogs() {
  const featuredContainer = document.getElementById('featuredBlogs');
  const latestContainer = document.getElementById('latestBlogs');
  const paginationContainer = document.getElementById('paginationContainer');
  const pageInfo = document.getElementById('pageInfo');
  
  if (!featuredContainer || !latestContainer) return;
  
  const response = await fetchBlogs({ search: currentSearch, category: currentCategory, page: currentPage, limit: 10 });
  const blogs = response.data || [];
  const pagination = response.pagination;
  
  if (blogs.length === 0) {
    if (currentPage === 1 && !currentSearch && !currentCategory) {
      latestContainer.innerHTML = '<p class="text-center w-100">No blogs published yet.</p>';
      featuredContainer.innerHTML = '<p class="text-center w-100">No featured blogs.</p>';
    } else {
      latestContainer.innerHTML = '<p class="text-center w-100">No blogs found matching your criteria.</p>';
      if (currentPage === 1) featuredContainer.innerHTML = '<p class="text-center w-100">No featured blogs.</p>';
    }
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }
  
  // Render Featured Blog only on page 1 without search
  if (currentPage === 1 && !currentSearch && !currentCategory && blogs.length > 0) {
    const featured = blogs[0];
    featuredContainer.innerHTML = createBlogCardHTML(featured);
    
    const latest = blogs.slice(1);
    if (latest.length > 0) {
      latestContainer.innerHTML = latest.map(blog => createBlogCardHTML(blog)).join('');
      document.getElementById('latestSection').style.display = 'block';
    } else {
      latestContainer.innerHTML = '';
      if (!currentSearch && !currentCategory) {
        document.getElementById('latestSection').style.display = 'none';
      }
    }
  } else {
    // Hide featured section when paginating or searching
    if (document.getElementById('featured')) {
      document.getElementById('featured').style.display = 'none';
    }
    latestContainer.innerHTML = blogs.map(blog => createBlogCardHTML(blog)).join('');
    document.getElementById('latestSection').style.display = 'block';
  }
  
  // Setup Pagination
  if (pagination && pagination.totalPages > 1) {
    if (paginationContainer) paginationContainer.style.display = 'flex';
    if (pageInfo) pageInfo.textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
    
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
      prevBtn.disabled = pagination.page === 1;
      prevBtn.onclick = () => {
        if (pagination.page > 1) {
          currentPage--;
          renderHomeBlogs();
          document.getElementById('latestSection').scrollIntoView({ behavior: 'smooth' });
        }
      };
    }
    
    if (nextBtn) {
      nextBtn.disabled = pagination.page === pagination.totalPages;
      nextBtn.onclick = () => {
        if (pagination.page < pagination.totalPages) {
          currentPage++;
          renderHomeBlogs();
          document.getElementById('latestSection').scrollIntoView({ behavior: 'smooth' });
        }
      };
    }
  } else {
    if (paginationContainer) paginationContainer.style.display = 'none';
  }
}

// Setup Filters and Search Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      currentSearch = searchInput.value.trim();
      currentPage = 1;
      renderHomeBlogs();
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        renderHomeBlogs();
      }
    });
  }
  
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Update active class
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        currentCategory = e.target.getAttribute('data-category');
        currentPage = 1;
        renderHomeBlogs();
      });
    });
  }
});

// Render Dashboard Data
async function renderDashboard() {
  const user = getCurrentUser();
  const userNameEl = document.getElementById('dashboardUserName');
  if (userNameEl) userNameEl.textContent = user.name;
  
  const response = await fetchBlogs({ limit: 1000, author: user._id });
  const userBlogs = response.data || [];
  
  const statPublished = document.getElementById('statPublished');
  const statWords = document.getElementById('statWords');
  
  if (statPublished) statPublished.textContent = userBlogs.length;
  if (statWords) {
    const totalWords = userBlogs.reduce((acc, blog) => acc + (blog.content.trim().split(/\s+/).length), 0);
    statWords.textContent = totalWords;
  }
  
  const listContainer = document.getElementById('dashboardList');
  if (!listContainer) return;
  
  if (userBlogs.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-folder-open"></i>
        <h3>No posts yet</h3>
        <p>You haven't published any blogs. Create your first post now!</p>
        <a href="create-blog.html" class="btn btn-primary mt-4">Create New Blog</a>
      </div>
    `;
    return;
  }
  
  listContainer.innerHTML = userBlogs.map(blog => `
    <div class="dashboard-list-item">
      <div class="item-info">
        <h4>${blog.title}</h4>
        <div class="item-meta">
          <span><i class="fa-regular fa-calendar"></i> ${formatDate(blog.createdAt)}</span>
          <span style="text-transform: capitalize;"><i class="fa-solid fa-tag"></i> ${blog.category.replace('-', ' ')}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-outline" onclick="editBlog('${blog._id}')">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteBlog('${blog._id}')">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Render Profile Data
async function renderProfile() {
  const user = getCurrentUser();
  const profile = await fetchUserProfile();
  
  document.getElementById('profileLoading').style.display = 'none';
  
  if (!profile) {
    showToast('Failed to load profile', 'error');
    return;
  }
  
  document.getElementById('profileContent').style.display = 'block';
  document.getElementById('profileInitials').textContent = profile.name.charAt(0).toUpperCase();
  document.getElementById('profileName').textContent = profile.name;
  document.getElementById('profileEmail').textContent = profile.email;
  
  // Format Member Since
  document.getElementById('profileMemberSince').textContent = formatDate(profile.createdAt);
  
  // Calculate Total Blogs
  const response = await fetchBlogs({ limit: 1000, author: user._id });
  const userBlogs = response.data || [];
  
  document.getElementById('profileTotalBlogs').textContent = userBlogs.length;
}

// Delete Blog
window.deleteBlog = async function(id) {
  if (confirm('Are you sure you want to delete this blog post?')) {
    const success = await apiDeleteBlog(id);
    if (success) {
      showToast('Blog deleted successfully', 'success');
      renderDashboard(); // Refresh
    }
  }
};

window.editBlog = function(id) {
  window.location.href = `create-blog.html?edit=${id}`;
};

// ==========================================
// UTILITIES
// ==========================================

function createBlogCardHTML(blog) {
  const authorName = blog.author && typeof blog.author === 'object' ? blog.author.name : (blog.author || 'Unknown');
  const initial = authorName.charAt(0).toUpperCase();
  const catName = blog.category.replace('-', ' ');
  
  let imgUrl = blog.image;
  if (!imgUrl) {
    const categoryImages = {
      'web-development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
      'mobile-apps': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
      'artificial-intelligence': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
      'education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
      'career': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80'
    };
    imgUrl = categoryImages[blog.category] || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80';
  }
  
  return `
    <div class="blog-card">
      <div class="blog-card-image">
        <img src="${imgUrl}" alt="${blog.title}" loading="lazy">
      </div>
      <div class="blog-card-content">
        <span class="blog-category">${catName}</span>
        <h3 class="blog-title"><a href="blog-details.html?id=${blog._id}">${blog.title}</a></h3>
        <p class="blog-excerpt">${blog.content.substring(0, 120)}...</p>
        <div class="blog-meta">
          <div class="blog-author">
            <div class="author-avatar">${initial}</div>
            <span>${authorName}</span>
          </div>
          <div>
            <span>${formatDate(blog.createdAt)}</span> • <span>${blog.readTime} min read</span>
          </div>
        </div>
        <a href="blog-details.html?id=${blog._id}" class="btn btn-outline" style="margin-top: 1rem; display: inline-block;">Read More</a>
      </div>
    </div>
  `;
}

async function renderBlogDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');
  
  if (!blogId) {
    document.getElementById('blogDetailsLoading').style.display = 'none';
    document.getElementById('blogDetailsError').style.display = 'block';
    return;
  }

  const blog = await fetchBlog(blogId);
  
  document.getElementById('blogDetailsLoading').style.display = 'none';
  
  if (!blog) {
    document.getElementById('blogDetailsError').style.display = 'block';
    return;
  }

  const authorName = blog.author && typeof blog.author === 'object' ? blog.author.name : (blog.author || 'Unknown');
  
  document.getElementById('blogDetailsContent').style.display = 'block';
  document.getElementById('detailCategory').textContent = blog.category.replace('-', ' ');
  document.getElementById('detailTitle').textContent = blog.title;
  document.getElementById('detailAuthor').innerHTML = `<i class="fa-solid fa-user"></i> ${authorName}`;
  document.getElementById('detailDate').innerHTML = `<i class="fa-solid fa-calendar"></i> ${formatDate(blog.createdAt)}`;
  document.getElementById('detailReadTime').innerHTML = `<i class="fa-solid fa-clock"></i> ${blog.readTime} min read`;
  
  if (blog.image) {
    document.getElementById('detailImage').src = blog.image;
    document.getElementById('detailImage').style.display = 'block';
  } else {
    document.getElementById('detailImage').style.display = 'none';
  }
  
  document.getElementById('detailContent').textContent = blog.content;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function setupMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const links = document.querySelector('.nav-links');
  
  if (btn && links) {
    btn.addEventListener('click', () => {
      links.classList.toggle('active');
    });
  }
}

function setupPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

function showToast(message, type = 'success') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '<i class="fa-solid fa-circle-check" style="color:var(--success-color)"></i>' 
                                  : '<i class="fa-solid fa-circle-exclamation" style="color:var(--error-color)"></i>';
                                  
  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
