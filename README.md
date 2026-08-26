# BlogSphere – Full Stack Blog Application

## Module 5 – Authentication & Dashboard

BlogSphere has been upgraded to **Module 5: Authentication & Dashboard**. The application provides a complete, secure JWT-based session architecture, route-level protection, server-side resource ownership checks, and a personalized user dashboard with live blogging statistics.

---

### Key Highlights & Features

1. **Secure JWT Authentication & Password Hashing**
   - User registration with input validation and duplicate email protection.
   - Secure password hashing using `bcryptjs` (salt rounds: 10).
   - Stateless JWT generation (`jsonwebtoken`) with configurable expiration and user ID payload.
   - User passwords are strictly excluded from all API responses (`.select('-password')`).

2. **Authentication Middleware (`middleware/authMiddleware.js`)**
   - Extracts and validates `Authorization: Bearer <token>` headers.
   - Attaches verified user details to `req.user`.
   - Rejects unauthenticated, invalid, or expired tokens with standard `HTTP 401 Unauthorized`.
   - Protects against user ID spoofing by determining identity solely from verified tokens.

3. **Protected Routes & Resource Ownership (`middleware/authMiddleware.js`, `controllers/blogController.js`)**
   - **Public Routes**: `GET /api/blogs`, `GET /api/blogs/:id`.
   - **Protected Routes**: `POST /api/blogs`, `PUT /api/blogs/:id`, `DELETE /api/blogs/:id`, `GET /api/blogs/my`, `GET /api/auth/me`.
   - **Ownership Security**: `PUT` and `DELETE` endpoints verify that `blog.author === req.user.id`. Unauthorized access attempts are rejected with `HTTP 403 Forbidden`.

4. **User-Specific Dashboard (`GET /api/blogs/my`, `dashboard.html`)**
   - Protected client-side view displaying only the logged-in user's private blogs.
   - Welcome banner featuring the authenticated user's name.
   - **Writing Analytics**:
     - Total published posts count.
     - Total words written calculation.
     - Profile completion status.
   - Direct action controls: **View**, **Edit**, and **Delete** for each authored post.
   - Empty-state UI prompting creation of the user's first post.

5. **User Profile (`profile.html`, `GET /api/auth/me`)**
   - Dedicated user profile displaying account credentials (name, email), member since date, and total blog count.
   - Direct session termination via the **Logout** button.

6. **Frontend Session Management & Interceptors (`frontend/js/auth.js`)**
   - Centralized authentication storage in `localStorage` storing JWT and non-sensitive user data.
   - Dynamic navbar reflecting state:
     - **Logged Out**: Home, Login, Register
     - **Logged In**: Home, Dashboard, Create Blog, Profile, Logout
   - Seamless `401 Unauthorized` interceptor that clears expired sessions and redirects users to `login.html` with friendly notifications.
   - Route guards preventing unauthenticated access to `/dashboard.html`, `/create-blog.html`, `/edit-blog.html`, and `/profile.html`.

---

### Project Structure

```text
BlogSphere/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── create-blog.html
│   ├── edit-blog.html
│   ├── blog-details.html
│   ├── profile.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       └── auth.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── test_module5.js
│   ├── test_frontend_simulation.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   └── Blog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── blogRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── blogController.js
│   └── middleware/
│       └── authMiddleware.js
│
├── .gitignore
└── README.md
```

---

### Installation & Setup

#### 1. Prerequisites
- **Node.js** (v16+ recommended)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

#### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

#### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/blogsphere
JWT_SECRET=your_secure_jwt_secret_key_here
```

#### 4. Run the Backend Server
```bash
# Production mode
npm start

# Development mode
npm run dev
```
The server will start on `http://localhost:5000` and automatically serve both the API and the static frontend.

#### 5. Open the Application
Navigate to `http://localhost:5000` in your web browser.

---

### REST API Documentation

#### Authentication Endpoints (`/api/auth`)

| Endpoint | Method | Access | Description | Request Body | Response Sample |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/register` | `POST` | Public | Registers a new user account | `{ "name": "...", "email": "...", "password": "..." }` | `HTTP 201`: `{ "success": true, "data": { "token": "...", "user": { "id": "...", "name": "...", "email": "..." } } }` |
| `/login` | `POST` | Public | Authenticates credentials and issues JWT | `{ "email": "...", "password": "..." }` | `HTTP 200`: `{ "success": true, "data": { "token": "...", "user": { "id": "...", "name": "...", "email": "..." } } }` |
| `/me` | `GET` | Private | Retrieves current authenticated profile | Header: `Authorization: Bearer <token>` | `HTTP 200`: `{ "success": true, "data": { "id": "...", "name": "...", "email": "...", "createdAt": "..." } }` |

#### Blog Endpoints (`/api/blogs`)

| Endpoint | Method | Access | Description | Request Parameters / Body |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | Public | Get all published blogs with search, category filtering & pagination | Query: `?search=...&category=...&page=1&limit=10` |
| `/:id` | `GET` | Public | Get a single blog post by its MongoDB ObjectId | URL param: `:id` |
| `/my` | `GET` | Private | Retrieve only the currently authenticated user's blogs | Header: `Authorization: Bearer <token>` |
| `/` | `POST` | Private | Create a new blog post attributed to `req.user` | Body: `{ "title": "...", "category": "...", "content": "...", "image": "..." }` |
| `/:id` | `PUT` | Private (Owner) | Update an existing blog post (verifies author ownership) | URL param: `:id`, Body: `{ "title": "...", "category": "...", "content": "...", "image": "..." }` |
| `/:id` | `DELETE` | Private (Owner) | Delete a blog post (verifies author ownership) | URL param: `:id`, Header: `Authorization: Bearer <token>` |

---

### Automated Verification & Testing

The repository contains an automated test suite verifying all Module 5 functionality:

```bash
cd backend
node test_module5.js
```

**Verification Checklist Tested**:
1. User registration with valid credentials.
2. Duplicate email registration rejection (`HTTP 400`).
3. Correct login returning JWT and sanitized user payload.
4. Wrong password / non-existing email rejections (`HTTP 401`).
5. `GET /api/auth/me` user profile verification without password exposure.
6. Route protection without token (`HTTP 401`).
7. Route protection with invalid/expired token (`HTTP 401`).
8. User-specific blog creation and isolated retrieval (`GET /api/blogs/my`).
9. Strict multi-user data isolation on the dashboard.
10. Cross-user update/delete protection (`HTTP 403 Forbidden`).
11. Authorized user blog update & deletion.

---

*Developed for Web Development Internship – Module 5.*
