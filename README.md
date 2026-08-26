# BlogSphere – Full Stack Blog Application

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-green.svg)](https://www.mongodb.com/)
[![JWT Auth](https://img.shields.io/badge/JWT-Secured-orange.svg)](https://jwt.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-purple.svg)](LICENSE)

BlogSphere is a modern, high-performance, full-stack blogging platform engineered with vanilla JavaScript, Node.js, Express, and MongoDB. It features end-to-end user authentication with JSON Web Tokens (JWT), role and ownership protected resource management, dynamic writing statistics, category taxonomy filtering, live full-text search, and a glassmorphic responsive UI.

Developed as the **Module 6 – Final Capstone Project** for the **Full Stack Web Development Internship**.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture & Flow](#-system-architecture--flow)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Installation & Local Setup](#-installation--local-setup)
- [Environment Variables](#-environment-variables)
- [REST API Documentation](#-rest-api-documentation)
- [Authentication & Security Architecture](#-authentication--security-architecture)
- [CRUD Operations & Ownership Verification](#-crud-operations--ownership-verification)
- [Deployment Guide](#-deployment-guide)
- [Screenshots & UI Showcase](#-screenshots--ui-showcase)
- [Live Demo & Repository](#-live-demo--repository)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## 🌟 Overview

Content creation platforms often suffer from bloated client bundles, complex setups, and loose authorization controls. **BlogSphere** solves this by providing:
1. **Lightweight & Fast Frontend**: Pure semantic HTML5, modern CSS3 custom properties with glassmorphism, and modular ES6 JavaScript without heavy framework overhead.
2. **Robust Stateless Backend**: Express 5 architecture with structured routing, controller-service pattern, mongoose schemas, and centralized error handling.
3. **Strict Resource Ownership**: Every blog is strictly associated with its author (`blog.author === req.user.id`). Unauthorized updates or deletions are rejected with `HTTP 403 Forbidden`.
4. **Instant Writing Analytics**: Real-time word counts, reading time estimates, post counts, and publication history.

---

## 🚀 Key Features

### 1. User Authentication & Profile
- **Registration & Login**: Input validation, password strength constraints, duplicate email detection, and bcrypt (salt rounds: 10) password hashing.
- **Stateless JWT Sessions**: JSON Web Tokens issued with 30-day expiration, securely stored in client storage.
- **Client Route Guards**: Immediate redirection for unauthorized users trying to access protected routes (`dashboard.html`, `create-blog.html`, `edit-blog.html`, `profile.html`).
- **Automatic 401 Interception**: Graceful session expiration handling, clearing tokens, and redirecting users to the sign-in screen with friendly flash alerts.
- **User Profile**: Dedicated account overview showing registration date, author avatar, credentials, and lifetime published post count.

### 2. Personalized Creator Dashboard
- **Live Statistics**: Real-time cards calculating total published articles, cumulative words written, and active author status.
- **Isolated User Posts**: Fetches only the authenticated user's private publications via `GET /api/blogs/my`.
- **Direct Post Management**: Instant access to **View**, **Edit**, and **Delete** actions with confirmation safeguards.
- **Zero-Data Empty States**: Helpful prompts encouraging first-time writers to publish their first story.

### 3. Full Blog CRUD & Discovery
- **Create**: Rich creation interface with real-time character and word count tracking.
- **Read & Explore**: Global feed with featured highlight articles, category tags, author avatars, and reading time calculations.
- **Search & Filter**: Real-time debounce search by keywords across titles and content, combined with category filters (Web Development, Mobile Apps, AI, Education, Career).
- **Pagination**: Server-driven pagination (`page`, `limit`, `totalPages`) for smooth navigation across large collections.
- **Update & Delete**: Pre-populated editing form and single-click removal protected by server ownership verification.

### 4. Responsive & Accessible Design
- **Mobile First**: Tested and optimized across mobile (320px–480px), tablet (768px), and desktop (1024px–1440px+).
- **Zero Horizontal Overflow**: Clean flexible grids and mobile hamburger navigation.
- **Interactive Micro-Animations**: Smooth hover elevations, button scaling, toast notifications, and loading spinners.

---

## 🔄 System Architecture & Flow

```
[ CLIENT BROWSER ]
       │
       ├──► HTML5 / CSS3 / Vanilla JS (auth.js, app.js, config.js)
       │         │
       │    [ Bearer JWT ]
       │         │
       ▼         ▼
[ NODE.JS / EXPRESS.JS BACKEND ] (Port 5000)
       │
       ├──► Health Check: GET /api/health
       ├──► CORS & URL-Encoded Parsers
       ├──► Auth Middleware (JWT Verification)
       │         │
       ├──► Routes: /api/auth & /api/blogs
       └──► Controllers & Ownership Checks
                 │
                 ▼
          [ MONGODB DATABASE ] (Mongoose ODM)
          ├── Users Collection (Hashed Passwords)
          └── Blogs Collection (Author Refs)
```

---

## 💻 Technology Stack

### Frontend
- **HTML5**: Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **CSS3**: CSS Custom Properties (Variables), Flexbox, CSS Grid, Glassmorphism backdrop-filters, and keyframe animations.
- **JavaScript (ES6+)**: Fetch API, Async/Await, Token management, DOM manipulation, Dynamic routing.
- **FontAwesome & Google Fonts**: Inter typeface and vector icons.

### Backend
- **Node.js**: Asynchronous JavaScript runtime environment.
- **Express.js (v5.x)**: RESTful API server framework with route grouping.
- **MongoDB & Mongoose (v9.x)**: Schema models, relationships (`populate`), indexes, and aggregation.
- **Authentication**: `jsonwebtoken` (JWT) & `bcryptjs` (password hashing).
- **Environment & Cross-Origin**: `dotenv`, `cors`.

---

## 📁 Project Directory Structure

```text
BlogSphere/
├── frontend/
│   ├── index.html              # Public Home / Blog Feed & Search
│   ├── login.html              # User Authentication Login
│   ├── register.html           # New User Registration
│   ├── dashboard.html          # Protected User Dashboard & Stats
│   ├── create-blog.html        # Create New Blog Post Form
│   ├── edit-blog.html          # Edit Existing Blog Form
│   ├── blog-details.html       # Full Single Blog Reading View
│   ├── profile.html            # User Account Profile & Settings
│   ├── css/
│   │   └── style.css           # Design System & Responsive Styles
│   └── js/
│       ├── config.js           # Dynamic Environment & API Base URL
│       ├── auth.js             # JWT Session, Route Guards & Headers
│       └── app.js              # REST API Integration & UI Controllers
│
├── backend/
│   ├── server.js               # Express Server & Static File Host
│   ├── package.json            # Node Dependencies & NPM Scripts
│   ├── .env.example            # Environment Configuration Template
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose Connection
│   ├── models/
│   │   ├── User.js             # User Mongoose Schema
│   │   └── Blog.js             # Blog Post Mongoose Schema
│   ├── routes/
│   │   ├── authRoutes.js       # Auth API Routes
│   │   └── blogRoutes.js       # Blog CRUD API Routes
│   ├── controllers/
│   │   ├── authController.js   # Auth Business Logic & JWT Issuance
│   │   └── blogController.js   # Blog CRUD & Ownership Handlers
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT Verification Middleware
│   ├── seeder.js               # Sample Data Ingestion Script
│   └── test_module6_e2e.js     # Automated E2E Test Suite (43 Tests)
│
├── docs/
│   └── LINKEDIN_POST.md        # Professional Project Showcase Post
├── .github/
│   └── workflows/
│       └── static.yml          # GitHub Pages Deployment Workflow
├── .gitignore                  # Git Ignore Rules (.env, node_modules)
└── README.md                   # Project Documentation
```

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
- **Node.js** (v16.0.0 or higher) – [Download Node.js](https://nodejs.org/)
- **MongoDB** (Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/aashutoshraushan25-cell/BlogSphere.git
cd BlogSphere
```

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Configure Environment Variables
Create a `.env` file inside the `backend/` directory:
```bash
cp .env.example .env
```

Edit `backend/.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/blogsphere
JWT_SECRET=super_secret_jwt_key_for_development
CLIENT_URL=http://localhost:5000
```

### 5. Seed Initial Data (Optional)
To populate sample blogs and demo authors:
```bash
node seeder.js
```

### 6. Run the Application
Start the backend server (which also serves the frontend):
```bash
npm start
```

Open your browser and navigate to:
👉 **`http://localhost:5000`**

### 7. Run Automated Tests
Validate all 11 test suites and 43 assertions:
```bash
node test_module6_e2e.js
```

---

## 🔐 Environment Variables

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Port on which Express server listens (default: 5000) | `5000` |
| `NODE_ENV` | Optional | Application runtime environment | `development` / `production` |
| `MONGODB_URI` | **Required** | MongoDB connection string (Local or Atlas) | `mongodb+srv://user:pass@cluster.mongodb.net/blogsphere` |
| `JWT_SECRET` | **Required** | Secret cryptographic key used to sign JWTs | `a_secure_random_string_here` |
| `CLIENT_URL` | Optional | Allowed CORS origin in production | `https://aashutoshraushan25-cell.github.io` |

---

## 📡 REST API Documentation

### System Health
| Method | Endpoint | Access | Description | Response Status |
| :--- | :--- | :---: | :--- | :---: |
| `GET` | `/api/health` | Public | Verify backend server status & health | `200 OK` |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description | Request Body | Response Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Public | Register new user account | `{ name, email, password }` | `201 Created` |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT | `{ email, password }` | `200 OK` |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile | *(None, Bearer JWT Header)* | `200 OK` |

### Blogs (`/api/blogs`)
| Method | Endpoint | Access | Description | Query / Body | Response Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `GET` | `/api/blogs` | Public | List all blogs (paginated, searchable, categorized) | `?search=&category=&page=1&limit=10` | `200 OK` |
| `GET` | `/api/blogs/:id` | Public | Get single blog with populated author | *(Param: id)* | `200 OK` / `404 Not Found` |
| `GET` | `/api/blogs/my` | Private | Fetch authenticated user's authored blogs | *(None, Bearer JWT Header)* | `200 OK` |
| `POST` | `/api/blogs` | Private | Create a new blog post | `{ title, category, content, image }` | `201 Created` |
| `PUT` | `/api/blogs/:id` | Private | Update an existing blog *(Author only)* | `{ title, category, content, image }` | `200 OK` / `403 Forbidden` |
| `DELETE` | `/api/blogs/:id` | Private | Delete a blog post *(Author only)* | *(Param: id, Bearer JWT Header)* | `200 OK` / `403 Forbidden` |

---

## 🛡️ Authentication & Security Architecture

1. **Password Encryption**: Stored passwords are cryptographically hashed using `bcryptjs` with 10 salt rounds before database insertion.
2. **Stateless JWT**: Tokens contain the user's MongoDB `_id` payload and expire in 30 days. No session data is persisted in server memory.
3. **Password Exclusion**: Mongoose queries explicitly exclude user passwords (`.select('-password')`) preventing leakage in responses.
4. **Bearer Header Interceptor**: `frontend/js/auth.js` automatically attaches `Authorization: Bearer <token>` to protected requests and handles HTTP 401 session expirations.
5. **No Spoofing**: `req.user` is populated solely by extracting and verifying the JWT token in `authMiddleware.js`.

---

## 📝 CRUD Operations & Ownership Verification

- **Create**: Authenticated users submit a title, category, and body. The server automatically assigns `req.user._id` as the author and calculates reading time.
- **Read**: Blogs are queried with author population (`.populate('author', 'name email')`). Regex searches match both titles and contents.
- **Update & Delete**: When `PUT` or `DELETE` requests are received:
  ```javascript
  if (blog.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to modify this blog'
    });
  }
  ```
  This guarantees that users can only manage their own publications.

---

## 🚀 Deployment Guide

### Architecture Overview
- **Frontend**: Hosted statically via **GitHub Pages**, **Vercel**, or served directly by Express.
- **Backend**: Hosted on **Render**, **Railway**, or **AWS EC2**.
- **Database**: **MongoDB Atlas** Cloud Database.

### 1. MongoDB Atlas Setup
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist Network Access (`0.0.0.0/0`).
3. Copy your connection string (`mongodb+srv://...`).

### 2. Backend Deployment (Render)
1. Link your GitHub repository to [Render](https://render.com/).
2. Create a new **Web Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add Environment Variables in Render Dashboard:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Your Secure Random String>`
   - `CLIENT_URL`: `https://aashutoshraushan25-cell.github.io` (or your frontend domain)

### 3. Frontend Configuration
Set your deployed backend URL in `frontend/js/config.js`:
```javascript
PROD_API_URL: 'https://your-backend-app.onrender.com/api'
```

---

## 📸 Screenshots & UI Showcase

| Home Feed & Featured Story | User Dashboard & Analytics |
| :---: | :---: |
| *(Blog discovery, search & categories)* | *(Personalized stats & management)* |

| Create & Edit Blog Form | User Profile & Security |
| :---: | :---: |
| *(Real-time word & char counter)* | *(Account details & logout)* |

---

## 🔗 Live Demo & Repository

- **GitHub Repository**: [https://github.com/aashutoshraushan25-cell/BlogSphere.git](https://github.com/aashutoshraushan25-cell/BlogSphere.git)
- **Live Application**: [http://localhost:5000](http://localhost:5000) *(Configured for Cloud Deployment)*

---

## 👤 Author & Acknowledgments

- **Author**: Aashutosh Raushan
- **GitHub**: [@aashutoshraushan25-cell](https://github.com/aashutoshraushan25-cell)
- **Email**: `aashutoshraushan25@gmail.com`
- **Program**: Full Stack Web Development Internship (Module 6 Capstone Project)

Special thanks to the internship mentors and the open-source community for guidance and support!
