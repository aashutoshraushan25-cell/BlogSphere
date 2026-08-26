/**
 * BlogSphere - Main Application Logic
 * Integrates Auth module, CRUD operations via REST API, and UI interactivity
 */

const API_URL = (typeof window !== 'undefined' && window.API_BASE_URL) ? window.API_BASE_URL : '/api';

// DOM Elements & Initialization
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
  if (path.includes('index.html') || path.endsWith('/') || path === '') {
    renderHomeBlogs();
  } else if (path.includes('dashboard.html')) {
    if (requireAuth()) {
      renderDashboard();
    }
  } else if (path.includes('create-blog.html') || path.includes('edit-blog.html')) {
    if (requireAuth()) {
      setupCreateBlogForm();
    }
  } else if (path.includes('blog-details.html')) {
    renderBlogDetails();
  } else if (path.includes('profile.html')) {
    if (requireAuth()) {
      renderProfile();
    }
  } else if (path.includes('login.html')) {
    if (!redirectIfAuth()) {
      setupLoginForm();
      checkAuthMessages();
    }
  } else if (path.includes('register.html')) {
    if (!redirectIfAuth()) {
      setupRegisterForm();
    }
  }
}

// Check and display any session/redirect messages
function checkAuthMessages() {
  const sessionMsg = sessionStorage.getItem('session_message');
  const redirectMsg = sessionStorage.getItem('auth_redirect_message');
  const regSuccessMsg = sessionStorage.getItem('reg_success');

  if (sessionMsg) {
    showToast(sessionMsg, 'error');
    displayAuthAlert(sessionMsg, 'error');
    sessionStorage.removeItem('session_message');
  } else if (redirectMsg) {
    showToast(redirectMsg, 'info');
    displayAuthAlert(redirectMsg, 'info');
    sessionStorage.removeItem('auth_redirect_message');
  } else if (regSuccessMsg) {
    showToast(regSuccessMsg, 'success');
    displayAuthAlert(regSuccessMsg, 'success');
    sessionStorage.removeItem('reg_success');
  }
}

function displayAuthAlert(message, type = 'error') {
  const card = document.querySelector('.auth-card');
  if (!card) return;
  
  const existingAlert = document.getElementById('authAlertBox');
  if (existingAlert) existingAlert.remove();

  const alertBox = document.createElement('div');
  alertBox.id = 'authAlertBox';
  alertBox.className = `alert alert-${type}`;
  alertBox.style.padding = '0.75rem 1rem';
  alertBox.style.marginBottom = '1.25rem';
  alertBox.style.borderRadius = 'var(--radius-md)';
  alertBox.style.fontSize = '0.875rem';
  alertBox.style.display = 'flex';
  alertBox.style.alignItems = 'center';
  alertBox.style.gap = '0.5rem';

  if (type === 'error') {
    alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    alertBox.style.color = 'var(--error-color)';
    alertBox.style.border = '1px solid rgba(239, 68, 68, 0.2)';
    alertBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${message}</span>`;
  } else if (type === 'success') {
    alertBox.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
    alertBox.style.color = 'var(--success-color)';
    alertBox.style.border = '1px solid rgba(16, 185, 129, 0.2)';
    alertBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
  } else {
    alertBox.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
    alertBox.style.color = 'var(--primary-color)';
    alertBox.style.border = '1px solid rgba(99, 102, 241, 0.2)';
    alertBox.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${message}</span>`;
  }

  const form = card.querySelector('form');
  if (form) {
    card.insertBefore(alertBox, form);
  }
}

// ==========================================
// BLOG API CALLS
// ==========================================

/**
 * Fetch all public blogs (supports search, category, pagination)
 */
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

/**
 * Fetch a single blog by ID
 */
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

/**
 * Fetch currently authenticated user's private blogs (GET /api/blogs/my)
 */
async function fetchMyBlogs() {
  try {
    const res = await fetchWithAuth(`${API_URL}/blogs/my`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    return [];
  }
}

/**
 * Create a new blog post (Protected: POST /api/blogs)
 */
async function apiCreateBlog(blogData) {
  try {
    const res = await fetchWithAuth(`${API_URL}/blogs`, {
      method: 'POST',
      body: JSON.stringify(blogData)
    });
    const data = await res.json();
    
    if (!data.success) {
      showToast(data.message || 'Failed to create blog', 'error');
    }
    return data.success;
  } catch (error) {
    showToast(error.message || 'Failed to create blog', 'error');
    return false;
  }
}

/**
 * Update an existing blog post (Protected: PUT /api/blogs/:id)
 */
async function apiUpdateBlog(id, blogData) {
  try {
    const res = await fetchWithAuth(`${API_URL}/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData)
    });
    const data = await res.json();
    
    if (!data.success) {
      showToast(data.message || 'Failed to update blog', 'error');
    }
    return data.success;
  } catch (error) {
    showToast(error.message || 'Failed to update blog', 'error');
    return false;
  }
}

/**
 * Delete a blog post (Protected: DELETE /api/blogs/:id)
 */
async function apiDeleteBlog(id) {
  try {
    const res = await fetchWithAuth(`${API_URL}/blogs/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    
    if (!data.success) {
      showToast(data.message || 'Failed to delete blog', 'error');
    }
    return data.success;
  } catch (error) {
    showToast(error.message || 'Failed to delete blog', 'error');
    return false;
  }
}

// ==========================================
// FORM CONTROLLERS (LOGIN & REGISTER)
// ==========================================

// Setup Login Form
function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = form.querySelector('button[type="submit"]');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      displayAuthAlert('Please enter both email and password', 'error');
      return;
    }

    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';

    const result = await apiLogin(email, password);

    if (result.success) {
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      showToast(result.message || 'Login failed', 'error');
      displayAuthAlert(result.message || 'Invalid email or password', 'error');
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
    const submitBtn = form.querySelector('button[type="submit"]');

    if (name.length < 2) {
      showToast('Name must be at least 2 characters', 'error');
      displayAuthAlert('Name must be at least 2 characters', 'error');
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      showToast('Please provide a valid email address', 'error');
      displayAuthAlert('Please provide a valid email address', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      displayAuthAlert('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      displayAuthAlert('Passwords do not match', 'error');
      return;
    }

    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

    const result = await apiRegister(name, email, password);

    if (result.success) {
      sessionStorage.setItem('reg_success', 'Account created successfully! Please sign in.');
      showToast('Registration successful! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 800);
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      showToast(result.message || 'Registration failed', 'error');
      displayAuthAlert(result.message || 'Registration failed. Email may already be registered.', 'error');
    }
  });
}

// ==========================================
// CREATE & EDIT BLOG FORM
// ==========================================

async function setupCreateBlogForm() {
  const form = document.getElementById('createBlogForm');
  const contentInput = document.getElementById('content');
  const charCounter = document.getElementById('charCounter');
  const formTitle = document.querySelector('.create-blog-container h1') || document.querySelector('.auth-container h2');
  const submitBtn = document.querySelector('#createBlogForm button[type="submit"]');
  
  if (!form) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id') || urlParams.get('edit');
  
  if (editId) {
    if (formTitle) formTitle.textContent = 'Edit Blog Post';
    if (submitBtn) submitBtn.textContent = 'Update Blog';
    document.title = 'Edit Blog - BlogSphere';
    
    const blog = await fetchBlog(editId);
    if (blog) {
      // Check if current user is the author
      const currentUser = getCurrentUser();
      const authorId = blog.author && typeof blog.author === 'object' ? blog.author._id : blog.author;
      if (currentUser && authorId && authorId.toString() !== currentUser.id && authorId.toString() !== currentUser._id) {
        showToast('You are not authorized to edit this blog', 'error');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1200);
        return;
      }

      document.getElementById('title').value = blog.title;
      document.getElementById('category').value = blog.category;
      contentInput.value = blog.content;
      if (document.getElementById('image') && blog.image) {
        document.getElementById('image').value = blog.image;
      }
      const words = blog.content.trim() === '' ? 0 : blog.content.trim().split(/\s+/).filter(Boolean).length;
      charCounter.textContent = `${words} words | ${blog.content.length} characters`;
    } else {
      showToast('Blog not found', 'error');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
      return;
    }
  }
  
  contentInput.addEventListener('input', () => {
    const text = contentInput.value;
    const charCount = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
    charCounter.textContent = `${words} words | ${charCount} characters`;
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const content = contentInput.value.trim();
    const imageInput = document.getElementById('image');
    const image = imageInput ? imageInput.value.trim() : '';
    
    if (title.length < 5) {
      showToast('Title must be at least 5 characters long', 'error');
      return;
    }

    if (content.length < 50) {
      showToast('Content must be at least 50 characters long', 'error');
      return;
    }
    
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    
    let success;
    if (editId) {
      success = await apiUpdateBlog(editId, { title, category, content, image });
    } else {
      success = await apiCreateBlog({ title, category, content, image });
    }
    
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
    
    if (success) {
      showToast(editId ? 'Blog updated successfully!' : 'Blog published successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    }
  });
}

// ==========================================
// DASHBOARD RENDERING
// ==========================================

async function renderDashboard() {
  const user = getCurrentUser();
  const userNameEl = document.getElementById('dashboardUserName');
  if (userNameEl && user) {
    userNameEl.textContent = user.name;
  }
  
  const listContainer = document.getElementById('dashboardList');
  if (listContainer) {
    listContainer.innerHTML = `
      <div class="text-center" style="padding: 3rem 0;">
        <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--primary-color);"></i>
        <p class="mt-4">Loading your dashboard...</p>
      </div>
    `;
  }

  // Fetch only the logged-in user's blogs from GET /api/blogs/my
  const userBlogs = await fetchMyBlogs();
  
  const statPublished = document.getElementById('statPublished');
  const statWords = document.getElementById('statWords');
  
  if (statPublished) statPublished.textContent = userBlogs.length;
  if (statWords) {
    const totalWords = userBlogs.reduce((acc, blog) => {
      const words = blog.content ? blog.content.trim().split(/\s+/).filter(Boolean).length : 0;
      return acc + words;
    }, 0);
    statWords.textContent = totalWords.toLocaleString();
  }
  
  if (!listContainer) return;
  
  if (userBlogs.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-folder-open"></i>
        <h3>No blogs yet</h3>
        <p>You haven't created any blogs yet. Start your writing journey today!</p>
        <a href="create-blog.html" class="btn btn-primary mt-4">
          <i class="fa-solid fa-plus" style="margin-right: 0.5rem;"></i> Create New Blog
        </a>
      </div>
    `;
    return;
  }
  
  listContainer.innerHTML = userBlogs.map(blog => `
    <div class="dashboard-list-item">
      <div class="item-info">
        <h4>${escapeHTML(blog.title)}</h4>
        <div class="item-meta">
          <span><i class="fa-regular fa-calendar"></i> ${formatDate(blog.createdAt)}</span>
          <span style="text-transform: capitalize;"><i class="fa-solid fa-tag"></i> ${escapeHTML(blog.category.replace(/-/g, ' '))}</span>
          <span><i class="fa-solid fa-clock"></i> ${blog.readTime || 1} min read</span>
        </div>
      </div>
      <div class="item-actions">
        <a href="blog-details.html?id=${blog._id}" class="btn btn-sm btn-outline" title="View Blog">
          <i class="fa-solid fa-eye"></i> View
        </a>
        <button class="btn btn-sm btn-outline" onclick="editBlog('${blog._id}')" title="Edit Blog">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteBlog('${blog._id}')" title="Delete Blog">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Delete Blog Handler
window.deleteBlog = async function(id) {
  if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
    const success = await apiDeleteBlog(id);
    if (success) {
      showToast('Blog deleted successfully', 'success');
      renderDashboard(); // Refresh dashboard data
    }
  }
};

// Edit Blog Handler
window.editBlog = function(id) {
  window.location.href = `edit-blog.html?id=${id}`;
};

// ==========================================
// PROFILE RENDERING
// ==========================================

async function renderProfile() {
  const loadingEl = document.getElementById('profileLoading');
  const contentEl = document.getElementById('profileContent');

  if (loadingEl) loadingEl.style.display = 'block';
  if (contentEl) contentEl.style.display = 'none';
  
  const profile = await apiGetMe();
  const userBlogs = await fetchMyBlogs();
  
  if (loadingEl) loadingEl.style.display = 'none';
  
  if (!profile) {
    showToast('Failed to load profile details', 'error');
    return;
  }
  
  if (contentEl) contentEl.style.display = 'block';
  
  const initials = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';
  const profileInitialsEl = document.getElementById('profileInitials');
  const profileNameEl = document.getElementById('profileName');
  const profileEmailEl = document.getElementById('profileEmail');
  const profileMemberSinceEl = document.getElementById('profileMemberSince');
  const profileTotalBlogsEl = document.getElementById('profileTotalBlogs');

  if (profileInitialsEl) profileInitialsEl.textContent = initials;
  if (profileNameEl) profileNameEl.textContent = profile.name;
  if (profileEmailEl) profileEmailEl.textContent = profile.email;
  if (profileMemberSinceEl) profileMemberSinceEl.textContent = formatDate(profile.createdAt);
  if (profileTotalBlogsEl) profileTotalBlogsEl.textContent = userBlogs.length;
}

// ==========================================
// HOME PAGE BLOGS RENDERING
// ==========================================

let currentPage = 1;
let currentSearch = '';
let currentCategory = '';

async function renderHomeBlogs() {
  const featuredContainer = document.getElementById('featuredBlogs');
  const latestContainer = document.getElementById('latestBlogs');
  const paginationContainer = document.getElementById('paginationContainer');
  const pageInfo = document.getElementById('pageInfo');
  
  if (!featuredContainer || !latestContainer) return;
  
  latestContainer.innerHTML = `
    <div class="text-center w-100" style="padding: 2rem 0; grid-column: 1 / -1;">
      <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--primary-color);"></i>
      <p class="mt-4">Loading articles...</p>
    </div>
  `;

  const response = await fetchBlogs({ search: currentSearch, category: currentCategory, page: currentPage, limit: 10 });
  const blogs = response.data || [];
  const pagination = response.pagination;
  
  if (blogs.length === 0) {
    if (currentPage === 1 && !currentSearch && !currentCategory) {
      latestContainer.innerHTML = '<p class="text-center w-100" style="grid-column: 1 / -1;">No blogs published yet.</p>';
      featuredContainer.innerHTML = '<p class="text-center w-100">No featured blogs available.</p>';
    } else {
      latestContainer.innerHTML = '<p class="text-center w-100" style="grid-column: 1 / -1;">No blogs found matching your criteria.</p>';
      if (currentPage === 1) featuredContainer.innerHTML = '<p class="text-center w-100">No matching featured story.</p>';
    }
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }
  
  // Render Featured Blog only on page 1 without filters
  if (currentPage === 1 && !currentSearch && !currentCategory && blogs.length > 0) {
    const featured = blogs[0];
    featuredContainer.innerHTML = createBlogCardHTML(featured);
    
    const latest = blogs.slice(1);
    if (latest.length > 0) {
      latestContainer.innerHTML = latest.map(blog => createBlogCardHTML(blog)).join('');
      const latestSec = document.getElementById('latestSection');
      if (latestSec) latestSec.style.display = 'block';
    } else {
      latestContainer.innerHTML = '<p class="text-center w-100" style="grid-column: 1 / -1;">More articles coming soon!</p>';
    }
  } else {
    // Hide featured section when paginating or filtering
    const feat = document.getElementById('featured');
    if (feat) feat.style.display = 'none';
    latestContainer.innerHTML = blogs.map(blog => createBlogCardHTML(blog)).join('');
    const latestSec = document.getElementById('latestSection');
    if (latestSec) latestSec.style.display = 'block';
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

// Search and Filter Setup
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
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        currentCategory = e.target.getAttribute('data-category');
        currentPage = 1;
        renderHomeBlogs();
      });
    });
  }
});

// ==========================================
// BLOG DETAILS RENDERING
// ==========================================

async function renderBlogDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');
  
  const loadingEl = document.getElementById('blogDetailsLoading');
  const errorEl = document.getElementById('blogDetailsError');
  const contentEl = document.getElementById('blogDetailsContent');

  if (!blogId) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'block';
    return;
  }

  const blog = await fetchBlog(blogId);
  
  if (loadingEl) loadingEl.style.display = 'none';
  
  if (!blog) {
    if (errorEl) errorEl.style.display = 'block';
    return;
  }

  const authorName = blog.author && typeof blog.author === 'object' ? blog.author.name : (blog.author || 'Anonymous');
  
  if (contentEl) contentEl.style.display = 'block';
  document.getElementById('detailCategory').textContent = blog.category.replace(/-/g, ' ');
  document.getElementById('detailTitle').textContent = blog.title;
  document.getElementById('detailAuthor').innerHTML = `<i class="fa-solid fa-user"></i> ${escapeHTML(authorName)}`;
  document.getElementById('detailDate').innerHTML = `<i class="fa-solid fa-calendar"></i> ${formatDate(blog.createdAt)}`;
  document.getElementById('detailReadTime').innerHTML = `<i class="fa-solid fa-clock"></i> ${blog.readTime || 1} min read`;
  
  const imageEl = document.getElementById('detailImage');
  if (imageEl) {
    if (blog.image) {
      imageEl.src = blog.image;
      imageEl.style.display = 'block';
    } else {
      imageEl.style.display = 'none';
    }
  }
  
  document.getElementById('detailContent').textContent = blog.content;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function createBlogCardHTML(blog) {
  const authorName = blog.author && typeof blog.author === 'object' ? blog.author.name : (blog.author || 'Anonymous');
  const initial = authorName.charAt(0).toUpperCase();
  const catName = blog.category.replace(/-/g, ' ');
  
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
        <img src="${imgUrl}" alt="${escapeHTML(blog.title)}" loading="lazy">
      </div>
      <div class="blog-card-content">
        <span class="blog-category">${escapeHTML(catName)}</span>
        <h3 class="blog-title"><a href="blog-details.html?id=${blog._id}">${escapeHTML(blog.title)}</a></h3>
        <p class="blog-excerpt">${escapeHTML(blog.content.substring(0, 120))}...</p>
        <div class="blog-meta">
          <div class="blog-author">
            <div class="author-avatar">${initial}</div>
            <span>${escapeHTML(authorName)}</span>
          </div>
          <div>
            <span>${formatDate(blog.createdAt)}</span> • <span>${blog.readTime || 1} min read</span>
          </div>
        </div>
        <a href="blog-details.html?id=${blog._id}" class="btn btn-outline" style="margin-top: 1rem; display: inline-block;">Read More</a>
      </div>
    </div>
  `;
}

function formatDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setupMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const links = document.querySelector('.nav-links');
  
  if (btn && links) {
    btn.onclick = () => {
      links.classList.toggle('active');
    };
  }
}

function setupPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.onclick = function(e) {
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
    };
  });
}

function showToast(message, type = 'success') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '<i class="fa-solid fa-circle-check" style="color:var(--success-color)"></i>';
  if (type === 'error') {
    icon = '<i class="fa-solid fa-circle-exclamation" style="color:var(--error-color)"></i>';
  } else if (type === 'info') {
    icon = '<i class="fa-solid fa-circle-info" style="color:var(--primary-color)"></i>';
  }
                                   
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
  }, 3500);
}
