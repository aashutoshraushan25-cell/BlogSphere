const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../frontend');

const requiredFiles = [
  'index.html',
  'login.html',
  'register.html',
  'dashboard.html',
  'create-blog.html',
  'edit-blog.html',
  'blog-details.html',
  'profile.html',
  'css/style.css',
  'js/app.js',
  'js/auth.js'
];

console.log('========================================');
console.log('🔍 Frontend Integrity & Structure Check');
console.log('========================================\n');

let passed = 0;
let failed = 0;

function check(condition, msg) {
  if (condition) {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  }
}

// 1. Check all required files exist
requiredFiles.forEach(file => {
  const filePath = path.join(FRONTEND_DIR, file);
  check(fs.existsSync(filePath), `File exists: frontend/${file}`);
});

// 2. Check script tags in HTML files
const htmlFiles = [
  'index.html',
  'login.html',
  'register.html',
  'dashboard.html',
  'create-blog.html',
  'edit-blog.html',
  'blog-details.html',
  'profile.html'
];

htmlFiles.forEach(htmlFile => {
  const content = fs.readFileSync(path.join(FRONTEND_DIR, htmlFile), 'utf8');
  check(content.includes('<script src="js/auth.js"></script>') && content.includes('<script src="js/app.js"></script>'),
    `Scripts (auth.js & app.js) in frontend/${htmlFile}`);
});

// 3. Check Dashboard specific elements
const dashboardHtml = fs.readFileSync(path.join(FRONTEND_DIR, 'dashboard.html'), 'utf8');
['dashboardUserName', 'statPublished', 'statWords', 'dashboardList'].forEach(id => {
  check(dashboardHtml.includes(`id="${id}"`), `dashboard.html contains element #${id}`);
});

// 4. Check Profile specific elements
const profileHtml = fs.readFileSync(path.join(FRONTEND_DIR, 'profile.html'), 'utf8');
['profileLoading', 'profileContent', 'profileInitials', 'profileName', 'profileEmail', 'profileMemberSince', 'profileTotalBlogs'].forEach(id => {
  check(profileHtml.includes(`id="${id}"`), `profile.html contains element #${id}`);
});

// 5. Check Login specific elements
const loginHtml = fs.readFileSync(path.join(FRONTEND_DIR, 'login.html'), 'utf8');
['loginForm', 'email', 'password'].forEach(id => {
  check(loginHtml.includes(`id="${id}"`), `login.html contains element #${id}`);
});

// 6. Check Register specific elements
const registerHtml = fs.readFileSync(path.join(FRONTEND_DIR, 'register.html'), 'utf8');
['registerForm', 'fullname', 'email', 'password', 'confirmPassword'].forEach(id => {
  check(registerHtml.includes(`id="${id}"`), `register.html contains element #${id}`);
});

console.log('\n========================================');
console.log(`📊 Integrity Results: ${passed} Passed, ${failed} Failed`);
console.log('========================================');

if (failed > 0) process.exit(1);
