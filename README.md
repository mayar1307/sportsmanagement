# Sports & Events Management System

A full-stack Node.js web application for managing sports, events, rooms, and users.  
The system supports authentication, role-based access control, and both admin and user dashboards using server-side rendering with EJS.


## Features

- User registration and login
- JWT-based authentication
- Role-based authorization (Admin / User)
- Admin dashboard and user dashboard
- CRUD operations for sports, events, and rooms
- Secure password hashing using bcrypt
- Centralized error handling
- Clean layered architecture

##  Tech Stack
- Node.js
- Express.js
- MySQL
- EJS (Embedded JavaScript Templates)
- JWT (jsonwebtoken)
- bcrypt
- HTML, CSS, JavaScript
- Git & GitHub

##  Project Structure
webb/
├── controllers/
│ ├── SportController.js
│ └── UserController.js
├── services/
│ ├── AuthServices.js
│ ├── EventService.js
│ ├── RoomService.js
│ ├── SportService.js
│ └── UserService.js
├── repositories/
│ ├── EventRepository.js
│ ├── RoomRepository.js
│ ├── SportRepository.js
│ └── UserRepository.js
├── routes/
│ ├── authRoutes.js
│ ├── eventRoutes.js
│ ├── roomRoutes.js
│ ├── sportRoutes.js
│ └── userRoutes.js
├── middleware/
│ ├── authMiddleware.js
│ └── errorMiddleware.js
├── utils/
│ └── AppError.js
├── db/
├── public/
│ ├── css/
│ └── js/
├── views/
│ ├── partials/
│ │ ├── header.ejs
│ │ ├── footer.ejs
│ │ └── navbar.ejs
│ ├── admin.ejs
│ ├── coachdashboard.ejs
│ ├── events.ejs
│ ├── myevents.ejs
│ ├── login.ejs
│ └── register.ejs
├── .env
├── .gitignore
├── index.js
└── package.json


## Authentication & Security

- Passwords are securely hashed using bcrypt
- JWT tokens are issued on login
- Protected routes require authentication
- Admin-only routes are restricted using role-based middleware
- Centralized error handling with a custom AppError class


## Environment Variables
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdatabase
JWT_SECRET=your_jwt_secret


##  How to Run the Project
npm install
npm start


The application will be available at:
http://localhost:3000


##  Author
Mayar Kassar