const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    minlength: 5
  },
  category: {
    type: String,
    required: [true, 'Please select a category']
  },
  content: {
    type: String,
    required: [true, 'Please provide content for the blog'],
    minlength: 50
  },
  image: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    required: true
  },
  authorEmail: {
    type: String,
    required: true
  },
  readTime: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Blog', blogSchema);
