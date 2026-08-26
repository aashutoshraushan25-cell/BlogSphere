/**
 * BlogSphere - Module 6 End-to-End Automated Test Suite
 * Validates complete Authentication, Authorization, Ownership, Blog CRUD,
 * Health-check, Error Handling, and 404 endpoints.
 */

const BASE_URL = 'http://localhost:5000/api';

// Utility for assertions
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { error: 'Failed to parse JSON response' };
  }

  return { status: res.status, data };
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING MODULE 6 END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testUser1 = {
    name: 'Alice Developer',
    email: `alice_${timestamp}@example.com`,
    password: 'password123'
  };

  const testUser2 = {
    name: 'Bob Tester',
    email: `bob_${timestamp}@example.com`,
    password: 'password123'
  };

  let tokenUser1 = null;
  let tokenUser2 = null;
  let user1Id = null;
  let user2Id = null;
  let blogId = null;

  // 1. HEALTH CHECK
  console.log('🔹 1. Testing Health Check Endpoint:');
  {
    const res = await makeRequest('/health');
    assert(res.status === 200, 'GET /api/health returns HTTP 200');
    assert(res.data.success === true, 'Response contains success: true');
    assert(res.data.message === 'BlogSphere API is running', 'Response contains correct health message');
  }

  // 2. USER REGISTRATION
  console.log('\n🔹 2. Testing User Registration:');
  {
    // Invalid validation
    const invalidRes = await makeRequest('/auth/register', 'POST', { name: 'A', email: 'invalid', password: '123' });
    assert(invalidRes.status === 400, 'Invalid registration input returns HTTP 400');

    // Valid User 1
    const res1 = await makeRequest('/auth/register', 'POST', testUser1);
    assert(res1.status === 201, 'User 1 registered with HTTP 201');
    assert(res1.data.success === true && !!res1.data.data.token, 'Registration returns JWT token');
    tokenUser1 = res1.data.data.token;
    user1Id = res1.data.data.user.id || res1.data.data.user._id;

    // Duplicate email
    const dupRes = await makeRequest('/auth/register', 'POST', testUser1);
    assert(dupRes.status === 400, 'Duplicate registration returns HTTP 400');

    // Valid User 2
    const res2 = await makeRequest('/auth/register', 'POST', testUser2);
    assert(res2.status === 201, 'User 2 registered with HTTP 201');
    tokenUser2 = res2.data.data.token;
    user2Id = res2.data.data.user.id || res2.data.data.user._id;
  }

  // 3. USER LOGIN
  console.log('\n🔹 3. Testing User Login:');
  {
    const badLogin = await makeRequest('/auth/login', 'POST', { email: testUser1.email, password: 'wrongpassword' });
    assert(badLogin.status === 401, 'Invalid credentials return HTTP 401');

    const validLogin = await makeRequest('/auth/login', 'POST', { email: testUser1.email, password: testUser1.password });
    assert(validLogin.status === 200, 'Valid credentials return HTTP 200');
    assert(!!validLogin.data.data.token, 'Login returns new JWT token');
    tokenUser1 = validLogin.data.data.token;
  }

  // 4. AUTHENTICATED PROFILE (GET /api/auth/me)
  console.log('\n🔹 4. Testing Profile (GET /api/auth/me):');
  {
    const noAuth = await makeRequest('/auth/me');
    assert(noAuth.status === 401, 'Unauthenticated profile request returns HTTP 401');

    const authRes = await makeRequest('/auth/me', 'GET', null, tokenUser1);
    assert(authRes.status === 200, 'Authenticated profile request returns HTTP 200');
    assert(authRes.data.data.email === testUser1.email.toLowerCase(), 'Profile matches user email');
    assert(!authRes.data.data.password, 'Password is never exposed in profile response');
  }

  // 5. CREATE BLOG (Protected: POST /api/blogs)
  console.log('\n🔹 5. Testing Create Blog:');
  {
    const unauthBlog = await makeRequest('/blogs', 'POST', { title: 'Test', category: 'web-development', content: 'Test content' });
    assert(unauthBlog.status === 401, 'Unauthenticated blog creation returns HTTP 401');

    const newBlog = {
      title: 'Mastering Full Stack Development in 2026',
      category: 'web-development',
      content: 'Full Stack Web Development requires mastery of both frontend user experience and backend scalable APIs. This article explores essential concepts and architectural best practices.',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
    };

    const res = await makeRequest('/blogs', 'POST', newBlog, tokenUser1);
    assert(res.status === 201, 'Authenticated blog creation returns HTTP 201');
    assert(res.data.data.title === newBlog.title, 'Created blog title matches');
    assert(res.data.data.author.toString() === user1Id.toString(), 'Blog author ref matches User 1');
    blogId = res.data.data._id;
  }

  // 6. READ PUBLIC BLOGS (GET /api/blogs, pagination, search, categories)
  console.log('\n🔹 6. Testing Public Blog Queries:');
  {
    const allBlogs = await makeRequest('/blogs');
    assert(allBlogs.status === 200, 'GET /api/blogs returns HTTP 200');
    assert(Array.isArray(allBlogs.data.data), 'Returns blogs array');
    assert(!!allBlogs.data.pagination, 'Returns pagination metadata');

    const searchRes = await makeRequest('/blogs?search=Mastering');
    assert(searchRes.status === 200, 'Search query returns HTTP 200');
    assert(searchRes.data.data.some(b => b.title.includes('Mastering')), 'Search results contain matching title');

    const catRes = await makeRequest('/blogs?category=web-development');
    assert(catRes.status === 200, 'Category filter returns HTTP 200');
    assert(catRes.data.data.every(b => b.category === 'web-development'), 'All filtered blogs match category');
  }

  // 7. READ SINGLE BLOG & ERROR HANDLING (GET /api/blogs/:id)
  console.log('\n🔹 7. Testing Single Blog Details:');
  {
    const single = await makeRequest(`/blogs/${blogId}`);
    assert(single.status === 200, 'GET /api/blogs/:id returns HTTP 200');
    assert(single.data.data._id === blogId, 'Blog ID matches requested ID');
    assert(typeof single.data.data.author === 'object', 'Author is populated with name/email');

    const invalidId = await makeRequest('/blogs/invalidObjectId123');
    assert(invalidId.status === 404, 'Invalid ObjectId returns HTTP 404 gracefully without crash');

    const notFoundId = await makeRequest('/blogs/6a869dd2178b36f6a37d9e99');
    assert(notFoundId.status === 404, 'Nonexistent ID returns HTTP 404');
  }

  // 8. USER-SPECIFIC BLOGS (GET /api/blogs/my)
  console.log('\n🔹 8. Testing User Dashboard Blogs (GET /api/blogs/my):');
  {
    const user1Blogs = await makeRequest('/blogs/my', 'GET', null, tokenUser1);
    assert(user1Blogs.status === 200, 'GET /api/blogs/my for User 1 returns HTTP 200');
    assert(user1Blogs.data.data.some(b => b._id === blogId), 'User 1 blogs contains authored post');

    const user2Blogs = await makeRequest('/blogs/my', 'GET', null, tokenUser2);
    assert(user2Blogs.status === 200, 'GET /api/blogs/my for User 2 returns HTTP 200');
    assert(user2Blogs.data.data.length === 0, 'User 2 dashboard is isolated and empty');
  }

  // 9. OWNERSHIP SECURITY: UPDATE BLOG (PUT /api/blogs/:id)
  console.log('\n🔹 9. Testing Ownership Security on Update:');
  {
    const updatePayload = {
      title: 'Mastering Full Stack Development in 2026 (Updated Edition)',
      category: 'web-development',
      content: 'Updated content with even deeper insights into MongoDB indexing, JWT security, and modern frontend design systems.'
    };

    // User 2 tries to update User 1's post -> 403 Forbidden
    const unauthUpdate = await makeRequest(`/blogs/${blogId}`, 'PUT', updatePayload, tokenUser2);
    assert(unauthUpdate.status === 403, 'Non-author update rejected with HTTP 403 Forbidden');

    // User 1 updates their own post -> 200 OK
    const authUpdate = await makeRequest(`/blogs/${blogId}`, 'PUT', updatePayload, tokenUser1);
    assert(authUpdate.status === 200, 'Author update accepted with HTTP 200');
    assert(authUpdate.data.data.title === updatePayload.title, 'Updated title persists');
  }

  // 10. OWNERSHIP SECURITY: DELETE BLOG (DELETE /api/blogs/:id)
  console.log('\n🔹 10. Testing Ownership Security on Delete:');
  {
    // User 2 tries to delete User 1's post -> 403 Forbidden
    const unauthDelete = await makeRequest(`/blogs/${blogId}`, 'DELETE', null, tokenUser2);
    assert(unauthDelete.status === 403, 'Non-author delete rejected with HTTP 403 Forbidden');

    // User 1 deletes their own post -> 200 OK
    const authDelete = await makeRequest(`/blogs/${blogId}`, 'DELETE', null, tokenUser1);
    assert(authDelete.status === 200, 'Author delete accepted with HTTP 200');

    // Verify deleted
    const verifyDel = await makeRequest(`/blogs/${blogId}`);
    assert(verifyDel.status === 404, 'Deleted blog is no longer found (HTTP 404)');
  }

  // 11. 404 UNMATCHED API ROUTE
  console.log('\n🔹 11. Testing 404 Unmatched API Route:');
  {
    const notFoundRoute = await makeRequest('/nonexistent-service');
    assert(notFoundRoute.status === 404, 'Unmatched /api/* route returns standard JSON 404');
    assert(notFoundRoute.data.success === false, 'Returns success: false');
  }

  console.log('\n====================================================');
  console.log(`📊 SUMMARY: ${passedTests}/${totalTests} Tests Passed (${failedTests} Failed)`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Unexpected error running test suite:', err);
  process.exit(1);
});
