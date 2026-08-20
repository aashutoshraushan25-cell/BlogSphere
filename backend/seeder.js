const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Blog = require('./models/Blog');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const users = [
  {
    name: 'Aashutosh Raushan',
    email: 'aashutosh@example.com',
    password: 'password123'
  },
  {
    name: 'Tech Enthusiast',
    email: 'tech@example.com',
    password: 'password123'
  }
];

const blogs = [
  {
    title: 'Getting Started with Modern Web Development',
    category: 'web-development',
    content: 'Web development is evolving at a rapid pace with modern frameworks, tools, and best practices. In this article, we will explore HTML5 semantic elements, modern CSS layout techniques such as Flexbox and CSS Grid, and modern JavaScript features that make web development faster and more interactive than ever before.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
    readTime: 3
  },
  {
    title: 'The Rise of Artificial Intelligence in 2026',
    category: 'artificial-intelligence',
    content: 'Artificial Intelligence and machine learning are revolutionizing industries across the globe. From automated coding assistants and generative language models to autonomous systems, AI is transforming how we build software and solve complex problems in modern business and everyday life.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
    readTime: 4
  },
  {
    title: 'Building Cross-Platform Mobile Apps in 2026',
    category: 'mobile-apps',
    content: 'Cross-platform mobile application development allows developers to write code once and deploy across iOS and Android seamlessly. Learn about performance optimization, responsive layouts, native device features, and state management for scalable apps.',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
    readTime: 3
  },
  {
    title: 'Career Growth Strategies for Software Engineers',
    category: 'career',
    content: 'Navigating a career in software development requires continuous learning, strong problem-solving skills, and effective communication. Discover how to build impactful projects, contribute to open-source, and prepare for technical interviews to accelerate your career.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80',
    readTime: 3
  },
  {
    title: 'Continuous Learning and Modern Education in Tech',
    category: 'education',
    content: 'The tech industry values hands-on practice, curiosity, and persistent problem solving. Explore the best ways to structure your daily learning habits, build real-world full stack projects, and master modern development concepts effectively.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
    readTime: 2
  }
];

const importData = async () => {
  try {
    // Clear existing
    await User.deleteMany();
    await Blog.deleteMany();

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    const mainUser = createdUsers[0]._id;

    // Attach author to blogs
    const sampleBlogs = blogs.map((blog) => {
      return { ...blog, author: mainUser };
    });

    await Blog.insertMany(sampleBlogs);

    console.log('Sample Data Imported Successfully into Local MongoDB!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Blog.deleteMany();

    console.log('Data Destroyed from Local MongoDB!');
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
