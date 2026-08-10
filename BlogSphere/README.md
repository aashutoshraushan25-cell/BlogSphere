# BlogSphere

## Project Description

BlogSphere is a modern, responsive, and fully-featured frontend blog application built for developers, writers, and tech enthusiasts. It allows users to read blogs, register an account, log in, create new blogs, and manage their posts through a personal dashboard.

This project was built entirely on the frontend using HTML5, CSS3, and Vanilla JavaScript, relying on `localStorage` to simulate a backend database for users and blog posts.

## Internship Project Objective

This project serves as a comprehensive module for a Full Stack Web Development internship. It demonstrates proficiency in core frontend technologies, responsive web design principles, client-side data management, DOM manipulation, form validation, and modern UI/UX design. The codebase is clean, well-structured, and beginner-friendly.

## Features

- **Responsive Design**: Looks great on mobile, tablet, and desktop devices.
- **Authentication**: User registration and login flows with client-side form validation.
- **Dynamic Content**: Blogs are generated and displayed dynamically using JavaScript.
- **Dashboard**: A personalized space for users to see stats and manage their published blogs.
- **Create Blog**: A clean editor to write posts with a live word and character counter.
- **Local Data Persistence**: All users and blogs are stored in the browser's `localStorage` ensuring data is preserved across sessions without a database.
- **Modern UI**: Uses CSS variables, clean typography (Inter font), FontAwesome icons, gradient accents, and subtle shadows for a premium look and feel.

## Technologies Used

- **HTML5**: Semantic markup for structure.
- **CSS3**: Vanilla CSS for styling, Flexbox, CSS Grid, media queries, and animations.
- **JavaScript (ES6+)**: Core logic, DOM manipulation, and `localStorage` integration.
- **Font Awesome**: Icon library via CDN.
- **Google Fonts**: Custom typography (Inter).

## Folder Structure

```text
BlogSphere/
├── index.html           # Home page showing featured and latest blogs
├── login.html           # User login page
├── register.html        # User registration page
├── dashboard.html       # Protected dashboard to manage blogs and view stats
├── create-blog.html     # Protected form page to publish new blogs
├── css/
│   └── style.css        # Main stylesheet handling global styles and components
├── js/
│   └── app.js           # Core application logic, routing simulation, and data management
└── README.md            # Project documentation
```

## How to Run the Project

1. Clone or download this repository to your local machine.
2. Navigate to the `BlogSphere` directory.
3. Open the `index.html` file in any modern web browser.
   - Alternatively, use a local server like VS Code's "Live Server" extension for a better experience.
4. The application will automatically seed a few sample blogs so the home page isn't empty.
5. Try registering a new user, logging in, creating a blog, and deleting it from the dashboard!

---
*Built with ❤️ for Web Development Internship.*
