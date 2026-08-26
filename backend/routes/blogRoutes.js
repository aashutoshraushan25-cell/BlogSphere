const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlog,
  getMyBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBlogs)
  .post(protect, createBlog);

// User's own blogs route (must come before /:id)
router.get('/my', protect, getMyBlogs);

router.route('/:id')
  .get(getBlog)
  .put(protect, updateBlog)
  .delete(protect, deleteBlog);

module.exports = router;
