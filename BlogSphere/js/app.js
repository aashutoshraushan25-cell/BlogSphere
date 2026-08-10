/**
 * BlogSphere - Main JavaScript Application
 * Handles Auth, CRUD operations, and UI interactivity
 */

// DOM Elements & Setup
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// App Initialization
function initApp() {
  seedInitialData();
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
// DATA MANAGEMENT (LocalStorage)
// ==========================================

// Seed initial blogs if local storage is empty
function seedInitialData() {
  const existingBlogs = JSON.parse(localStorage.getItem('blogSphere_blogs')) || [];
  
  if (existingBlogs.length < 6) {
    const seedBlogs = [
      {
        id: '1',
        title: 'Getting Started with Full Stack Web Development in 2024',
        category: 'web-development',
        content: 'Full stack development is more exciting than ever. With modern tools and frameworks, developers can build robust applications faster. In this guide, we explore the essential skills needed to become a proficient full stack developer today, covering HTML, CSS, JavaScript, and beyond.',
        author: 'Alex Dev',
        authorEmail: 'alex@example.com',
        date: new Date().toISOString(),
        readTime: 5,
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80'
      },
      {
        id: '2',
        title: 'The Future of AI in Education',
        category: 'education',
        content: 'Artificial Intelligence is revolutionizing how we learn. From personalized tutoring systems to automated grading, AI helps educators focus on what matters most: student engagement and mentoring. Lets dive into the tools shaping the future of the classroom.',
        author: 'Sarah Tech',
        authorEmail: 'sarah@example.com',
        date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        readTime: 4,
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80'
      },
      {
        id: '3',
        title: 'Navigating Your Tech Career Path',
        category: 'career',
        content: 'Choosing a career path in technology can be overwhelming. Whether you want to be a frontend specialist, a backend guru, or a devops engineer, understanding the landscape is crucial. Here are top tips for landing your dream internship and growing your career.',
        author: 'Michael Code',
        authorEmail: 'michael@example.com',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        readTime: 6,
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80'
      },
      {
        id: '4',
        title: '10 CSS Tricks Every Developer Should Know',
        category: 'web-development',
        content: 'CSS has evolved massively. Features like CSS Grid, Flexbox, custom properties (variables), and container queries are changing how we build layouts. In this post, we explore 10 modern CSS tricks to elevate your frontend designs and make them fully responsive.',
        author: 'Jessica Style',
        authorEmail: 'jessica@example.com',
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        readTime: 3,
        image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&q=80'
      },
      {
        id: '5',
        title: 'Building Mobile Apps with Web Technologies',
        category: 'mobile-apps',
        content: 'Did you know you can build native-feeling mobile applications using just HTML, CSS, and JavaScript? Technologies like PWAs and hybrid frameworks have made it easier than ever to reach both iOS and Android users from a single codebase.',
        author: 'David Mobile',
        authorEmail: 'david@example.com',
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        readTime: 7,
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80'
      },
      {
        id: '6',
        title: 'Machine Learning Basics for Beginners',
        category: 'artificial-intelligence',
        content: 'Machine Learning can seem intimidating, but at its core, it is about teaching computers to recognize patterns in data. Lets break down the basic concepts like supervised learning, neural networks, and how you can get started with AI today.',
        author: 'Dr. Alan AI',
        authorEmail: 'alan@example.com',
        date: new Date(Date.now() - 86400000 * 14).toISOString(),
        readTime: 5,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80'
      }
    ];
    
    // Merge new seed blogs if they don't already exist
    seedBlogs.forEach(seed => {
      if (!existingBlogs.find(b => b.title === seed.title)) {
        existingBlogs.push(seed);
      }
    });
    
    localStorage.setItem('blogSphere_blogs', JSON.stringify(existingBlogs));
  }
}

// Get all blogs from storage
function getBlogs() {
  return JSON.parse(localStorage.getItem('blogSphere_blogs')) || [];
}

// Save blogs to storage
function saveBlogs(blogs) {
  localStorage.setItem('blogSphere_blogs', JSON.stringify(blogs));
}

// ==========================================
// AUTHENTICATION LOGIC
// ==========================================

// Register a new user
function register(name, email, password) {
  const users = JSON.parse(localStorage.getItem('blogSphere_users')) || [];
  
  if (users.find(u => u.email === email)) {
    showToast('Email already exists!', 'error');
    return false;
  }
  
  const newUser = { id: Date.now().toString(), name, email, password };
  users.push(newUser);
  localStorage.setItem('blogSphere_users', JSON.stringify(users));
  
  // Auto login after register
  localStorage.setItem('blogSphere_currentUser', JSON.stringify({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email
  }));
  
  return true;
}

// Login an existing user
function login(email, password) {
  const users = JSON.parse(localStorage.getItem('blogSphere_users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    localStorage.setItem('blogSphere_currentUser', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email
    }));
    return true;
  }
  return false;
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

// Route Protection: Require Auth
function requireAuth() {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
  }
}

// Route Protection: Redirect if already Auth
function redirectIfAuth() {
  if (getCurrentUser()) {
    window.location.href = 'dashboard.html';
  }
}

// Update navbar links based on auth state
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
// UI & FORM LOGIC
// ==========================================

// Setup Login Form
function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (login(email, password)) {
      showToast('Login successful!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      showToast('Invalid email or password', 'error');
    }
  });
}

// Setup Register Form
function setupRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    // Validation
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    if (register(name, email, password)) {
      showToast('Registration successful!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    }
  });
}

// Setup Create Blog Form
function setupCreateBlogForm() {
  const form = document.getElementById('createBlogForm');
  const contentInput = document.getElementById('content');
  const charCounter = document.getElementById('charCounter');
  
  if (!form) return;
  
  // Word/Character counter
  contentInput.addEventListener('input', () => {
    const text = contentInput.value;
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    charCounter.textContent = `${wordCount} words | ${charCount} characters`;
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const content = contentInput.value.trim();
    const imageInput = document.getElementById('image');
    const image = imageInput ? imageInput.value.trim() : '';
    
    if (title.length < 5) {
      showToast('Title must be at least 5 characters', 'error');
      return;
    }
    
    if (content.length < 50) {
      showToast('Content must be at least 50 characters', 'error');
      return;
    }
    
    const user = getCurrentUser();
    const blogs = getBlogs();
    
    const newBlog = {
      id: Date.now().toString(),
      title,
      category,
      content,
      image,
      author: user.name,
      authorEmail: user.email,
      date: new Date().toISOString(),
      readTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 200)) // Assuming 200 words/min
    };
    
    blogs.unshift(newBlog);
    saveBlogs(blogs);
    
    showToast('Blog published successfully!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  });
}

// Render Blogs on Home Page
function renderHomeBlogs() {
  const featuredContainer = document.getElementById('featuredBlogs');
  const latestContainer = document.getElementById('latestBlogs');
  if (!featuredContainer || !latestContainer) return;
  
  const blogs = getBlogs();
  
  if (blogs.length === 0) {
    latestContainer.innerHTML = '<p class="text-center w-100">No blogs published yet.</p>';
    return;
  }
  
  // Render Featured (just pick the first one for simplicity, or most recent)
  const featured = blogs[0];
  featuredContainer.innerHTML = createBlogCardHTML(featured);
  
  // Render Latest (next 3)
  const latest = blogs.slice(1, 4);
  if (latest.length > 0) {
    latestContainer.innerHTML = latest.map(blog => createBlogCardHTML(blog)).join('');
  } else {
    document.getElementById('latestSection').style.display = 'none';
  }
}

// Render Dashboard Data
function renderDashboard() {
  const user = getCurrentUser();
  const userNameEl = document.getElementById('dashboardUserName');
  if (userNameEl) userNameEl.textContent = user.name;
  
  const blogs = getBlogs();
  const userBlogs = blogs.filter(b => b.authorEmail === user.email);
  
  // Update Stats
  const statPublished = document.getElementById('statPublished');
  const statWords = document.getElementById('statWords');
  
  if (statPublished) statPublished.textContent = userBlogs.length;
  if (statWords) {
    const totalWords = userBlogs.reduce((acc, blog) => acc + (blog.content.trim().split(/\s+/).length), 0);
    statWords.textContent = totalWords;
  }
  
  // Render List
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
          <span><i class="fa-regular fa-calendar"></i> ${formatDate(blog.date)}</span>
          <span style="text-transform: capitalize;"><i class="fa-solid fa-tag"></i> ${blog.category.replace('-', ' ')}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-outline" onclick="editBlog('${blog.id}')">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteBlog('${blog.id}')">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Delete Blog
window.deleteBlog = function(id) {
  if (confirm('Are you sure you want to delete this blog post?')) {
    let blogs = getBlogs();
    blogs = blogs.filter(b => b.id !== id);
    saveBlogs(blogs);
    showToast('Blog deleted successfully', 'success');
    renderDashboard();
  }
};

// Edit Blog Stub (Just shows message since full edit wasn't explicitly strictly defined beyond button existence, but usually expected)
window.editBlog = function(id) {
  showToast('Edit feature coming soon!', 'success');
  // For a full implementation, you'd redirect to create-blog.html?id=X and prefill
};

// ==========================================
// UTILITIES
// ==========================================

// Create Blog Card HTML
function createBlogCardHTML(blog) {
  const initial = blog.author.charAt(0).toUpperCase();
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
        <h3 class="blog-title"><a href="#">${blog.title}</a></h3>
        <p class="blog-excerpt">${blog.content}</p>
        <div class="blog-meta">
          <div class="blog-author">
            <div class="author-avatar">${initial}</div>
            <span>${blog.author}</span>
          </div>
          <div>
            <span>${formatDate(blog.date)}</span> • <span>${blog.readTime} min read</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Format Date
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Mobile Menu Toggle
function setupMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const links = document.querySelector('.nav-links');
  
  if (btn && links) {
    btn.addEventListener('click', () => {
      links.classList.toggle('active');
    });
  }
}

// Password Visibility Toggle
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

// Toast Notification System
function showToast(message, type = 'success') {
  // Remove existing toast if any
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
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Hide and remove after 3s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
