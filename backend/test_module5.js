/**
 * Module 5 Automated Verification Suite
 * Tests all Auth, JWT, Protected Routes, User Dashboard isolation, Ownership security, and Token validation.
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Blog = require('./models/Blog');
const jwt = require('jsonwebtoken');

// Test Config
const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

async function runTests() {
  console.log('========================================');
  console.log('🚀 Starting Module 5 Verification Tests');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extra = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${extra}`);
      failed++;
    }
  }

  // Connect to DB for test inspection / seeding
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB database for tests.\n');

  const randomSuffix = Date.now();
  const userAEmail = `user_a_${randomSuffix}@test.com`;
  const userBEmail = `user_b_${randomSuffix}@test.com`;
  const password = 'Password123!';

  let tokenA = '';
  let tokenB = '';
  let userAId = '';
  let userBId = '';
  let blogAId = '';
  let blogBId = '';

  try {
    // 1. Register User A
    const regResA = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A', email: userAEmail, password })
    });
    const regDataA = await regResA.json();
    assert(regResA.status === 201 && regDataA.success && regDataA.data.token, '1. Register new user A');
    tokenA = regDataA.data.token;
    userAId = regDataA.data.user.id;

    // 2. Duplicate Registration Test
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A Dup', email: userAEmail, password })
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 400 && !dupData.success, '2. Reject duplicate email registration');

    // 3. Register User B
    const regResB = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: userBEmail, password })
    });
    const regDataB = await regResB.json();
    assert(regResB.status === 201 && regDataB.success && regDataB.data.token, '3. Register new user B');
    tokenB = regDataB.data.token;
    userBId = regDataB.data.user.id;

    // 4. Login with correct credentials
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail, password })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success && loginData.data.token && loginData.data.user.email === userAEmail, '4. Login with correct credentials');

    // 5. Login with wrong password
    const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail, password: 'WrongPassword999!' })
    });
    const wrongPassData = await wrongPassRes.json();
    assert(wrongPassRes.status === 401 && !wrongPassData.success, '5. Login with wrong password returns HTTP 401');

    // 6. Login with non-existing email
    const nonExistRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `nonexistent_${randomSuffix}@test.com`, password })
    });
    const nonExistData = await nonExistRes.json();
    assert(nonExistRes.status === 401 && !nonExistData.success, '6. Login with non-existing email returns HTTP 401');

    // 7. GET /api/auth/me (Profile endpoint)
    const meResA = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const meDataA = await meResA.json();
    assert(meResA.status === 200 && meDataA.success && meDataA.data.email === userAEmail && !meDataA.data.password, '7. GET /api/auth/me returns authenticated user without password');

    // 8. Access protected route without token
    const noTokenRes = await fetch(`${BASE_URL}/api/blogs/my`);
    const noTokenData = await noTokenRes.json();
    assert(noTokenRes.status === 401 && !noTokenData.success, '8. Accessing protected route without token returns HTTP 401');

    // 9. Access protected route with invalid/fake token
    const invalidTokenRes = await fetch(`${BASE_URL}/api/blogs/my`, {
      headers: { 'Authorization': 'Bearer fake_invalid_jwt_token_123' }
    });
    const invalidTokenData = await invalidTokenRes.json();
    assert(invalidTokenRes.status === 401 && !invalidTokenData.success, '9. Accessing protected route with invalid token returns HTTP 401');

    // 10. Create Blog as User A
    const blogResA = await fetch(`${BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'User A First Deep-Dive Article On Web Architecture',
        category: 'web-development',
        content: 'This is an extensive article published by User A exploring full-stack web application development and best security practices across distributed architectures.',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80'
      })
    });
    const blogDataA = await blogResA.json();
    assert(blogResA.status === 201 && blogDataA.success && blogDataA.data._id, '10. Create blog as User A');
    blogAId = blogDataA.data._id;

    // 11. Create Blog as User B
    const blogResB = await fetch(`${BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        title: 'User B Insights On Artificial Intelligence and Neural Models',
        category: 'artificial-intelligence',
        content: 'User B shares insightful perspectives on generative artificial intelligence, neural networks, machine learning models, and practical application integration patterns.',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80'
      })
    });
    const blogDataB = await blogResB.json();
    assert(blogResB.status === 201 && blogDataB.success && blogDataB.data._id, '11. Create blog as User B');
    blogBId = blogDataB.data._id;

    // 12. User A retrieves user blogs via GET /api/blogs/my (Should only receive Blog A)
    const myBlogsResA = await fetch(`${BASE_URL}/api/blogs/my`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const myBlogsDataA = await myBlogsResA.json();
    const onlyUserABlogs = myBlogsDataA.data.every(b => b.author._id === userAId || b.author === userAId);
    const hasBlogA = myBlogsDataA.data.some(b => b._id === blogAId);
    const hasNotBlogB = !myBlogsDataA.data.some(b => b._id === blogBId);
    assert(myBlogsResA.status === 200 && myBlogsDataA.success && onlyUserABlogs && hasBlogA && hasNotBlogB, '12. GET /api/blogs/my for User A contains ONLY User A blogs and NOT User B blogs');

    // 13. User B retrieves user blogs via GET /api/blogs/my (Should only receive Blog B)
    const myBlogsResB = await fetch(`${BASE_URL}/api/blogs/my`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const myBlogsDataB = await myBlogsResB.json();
    const onlyUserBBlogs = myBlogsDataB.data.every(b => b.author._id === userBId || b.author === userBId);
    const hasBlogB = myBlogsDataB.data.some(b => b._id === blogBId);
    const hasNotBlogA = !myBlogsDataB.data.some(b => b._id === blogAId);
    assert(myBlogsResB.status === 200 && myBlogsDataB.success && onlyUserBBlogs && hasBlogB && hasNotBlogA, '13. GET /api/blogs/my for User B contains ONLY User B blogs and NOT User A blogs');

    // 14. Ownership check: User A tries to update User B's blog (Expect 403 Forbidden)
    const updateForbiddenRes = await fetch(`${BASE_URL}/api/blogs/${blogBId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Hacked User B Title By Unauthorized User A',
        category: 'web-development',
        content: 'Attempted unauthorized tampering of content belonging to another user account.'
      })
    });
    const updateForbiddenData = await updateForbiddenRes.json();
    assert(updateForbiddenRes.status === 403 && !updateForbiddenData.success, '14. User A attempting to update User B blog returns HTTP 403 Forbidden');

    // 15. Ownership check: User A tries to delete User B's blog (Expect 403 Forbidden)
    const deleteForbiddenRes = await fetch(`${BASE_URL}/api/blogs/${blogBId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const deleteForbiddenData = await deleteForbiddenRes.json();
    assert(deleteForbiddenRes.status === 403 && !deleteForbiddenData.success, '15. User A attempting to delete User B blog returns HTTP 403 Forbidden');

    // 16. User A updates own blog (Expect 200 OK)
    const updateOwnRes = await fetch(`${BASE_URL}/api/blogs/${blogAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'User A Updated Article On Full Stack Cloud Architecture',
        category: 'web-development',
        content: 'This is the updated content authored legitimately by User A verifying that owners have complete update capabilities over their own posts.'
      })
    });
    const updateOwnData = await updateOwnRes.json();
    assert(updateOwnRes.status === 200 && updateOwnData.success && updateOwnData.data.title.includes('Updated Article'), '16. User A successfully updates own blog post');

    // 17. User A deletes own blog (Expect 200 OK)
    const deleteOwnRes = await fetch(`${BASE_URL}/api/blogs/${blogAId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const deleteOwnData = await deleteOwnRes.json();
    assert(deleteOwnRes.status === 200 && deleteOwnData.success, '17. User A successfully deletes own blog post');

    // 18. Verify blog is removed
    const getDeletedRes = await fetch(`${BASE_URL}/api/blogs/${blogAId}`);
    assert(getDeletedRes.status === 404, '18. Deleted blog is no longer accessible via GET /api/blogs/:id');

    // Clean up User B test blog
    await Blog.findByIdAndDelete(blogBId);
    await User.deleteMany({ email: { $in: [userAEmail, userBEmail] } });
    console.log('\nCleaned up test data from MongoDB.');

  } catch (err) {
    console.error('Test Execution Error:', err);
    failed++;
  } finally {
    await mongoose.disconnect();
  }

  console.log('\n========================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
