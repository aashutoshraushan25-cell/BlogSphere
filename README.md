# BlogSphere – Full Stack Blog Application

## Module 3 – Database Integration

BlogSphere has now completed its Module 3 Database Integration, fully integrating the Node.js + Express backend with a persistent MongoDB database using Mongoose. The frontend dynamically fetches, creates, updates, and deletes data securely using JWT authentication.

### Technologies

- **Node.js** & **Express.js**: Backend server and RESTful API framework.
- **MongoDB** & **Mongoose**: NoSQL database and object data modeling.
- **JWT (JSON Web Tokens)**: Secure stateless authentication.
- **bcryptjs**: Password hashing.
- **REST API**: Standardized endpoints for client-server communication.
- **HTML5, CSS3, Vanilla JS**: Frontend UI.

### Features

- User registration with password hashing (bcryptjs).
- User login with JWT generation.
- Protected routes requiring JWT authentication.
- Create new blog (requires auth) mapped to authenticated user using MongoDB ObjectIds.
- Read all blogs and individual blogs on dynamic details pages.
- Update blog (owner only verification).
- Delete blog (owner only verification).
- Seamless frontend-backend integration using `fetch` API.

### Project Structure

```text
BlogSphere/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── create-blog.html
│   ├── blog-details.html
│   ├── css/
│   └── js/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
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
└── README.md
```

### Installation & Setup

1. **Clone the repository** (or download it).
2. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Environment Variables**:
   Create a `.env` file in the `backend` folder based on `.env.example`:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

   *(For local testing, you can use `mongodb://127.0.0.1:27017/blogsphere` if you have MongoDB installed locally).*

5. **Start the backend server**:

   ```bash
   npm start
   # or
   npm run dev
   ```

   The server will start on `http://localhost:5000`.

6. **Start the Frontend**:
   Serve the `frontend/` directory using a local web server (e.g., VS Code's "Live Server" extension).
   Access the frontend via your browser. It is pre-configured to communicate with `http://localhost:5000/api`.

### API Documentation

#### Authentication Routes (`/api/auth`)

| Endpoint    | Method | Description                   | Auth Required | Request Body                |
| ----------- | ------ | ----------------------------- | ------------- | --------------------------- |
| `/register` | POST   | Register a new user           | No            | `{ name, email, password }` |
| `/login`    | POST   | Authenticate user & get token | No            | `{ email, password }`       |

#### Blog Routes (`/api/blogs`)

| Endpoint | Method | Description             | Auth Required | Request Body                          |
| -------- | ------ | ----------------------- | ------------- | ------------------------------------- |
| `/`      | GET    | Get all blogs           | No            | None                                  |
| `/:id`   | GET    | Get a single blog by ID | No            | None                                  |
| `/`      | POST   | Create a new blog       | Yes           | `{ title, category, content, image }` |
| `/:id`   | PUT    | Update a blog           | Yes (Owner)   | `{ title, category, content, image }` |
| `/:id`   | DELETE | Delete a blog           | Yes (Owner)   | None                                  |

*Note: Protected routes require a valid JWT in the request header:*

`Authorization: Bearer <token>`

---

*Built with ❤️ for Web Development Internship - Module 3.*
