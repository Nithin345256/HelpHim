# 🌉 HelpHim - Community Issue Management Platform

A full-stack MERN application for reporting, tracking, and resolving community issues with role-based access control, real-time geolocation, and public engagement features.

[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v4+-brightgreen.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-v4+-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

**IssueBridge** is a community-driven platform that connects citizens with municipal officers to report, track, and resolve civic issues efficiently. The platform enables users to:

- Report issues with photo evidence and precise geolocation
- Track issue status in real-time
- Engage with community through likes and comments
- Access specialized officer support based on issue type
- View public issues on an interactive map interface

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (User, Officer, Admin)
- **Protected routes** with middleware validation
- **Password hashing** with bcrypt

### 👥 User Features
- **Issue Reporting**: Create issues with title, description, photos, and location
- **Interactive Maps**: Use Leaflet for precise location selection
- **Current Location**: Auto-detect user's GPS coordinates
- **Dashboard**: View personal issue statistics and history
- **Issue Management**: Edit and delete own issues
- **Real-time Status Tracking**: Monitor issue progress

### 👮 Officer Features
- **Specialized Dashboard**: View issues by specialization (Water, Sanitation, Pothole, etc.)
- **Status Management**: Update issue status (Pending → In Progress → Resolved)
- **Issue Filtering**: Automatically filter relevant issues
- **Response Tracking**: Monitor resolved vs pending issues

### 🌍 Public Features
- **Public Issue Feed**: Browse all unresolved community issues
- **Anonymous Engagement**: Like and comment on issues without login
- **Session-based Tracking**: Maintain user preferences across visits
- **Responsive Design**: Mobile-friendly interface

### 🗺️ Geolocation Features
- **Interactive Maps**: Leaflet integration with OpenStreetMap
- **Reverse Geocoding**: Convert coordinates to readable addresses
- **GeoJSON Support**: MongoDB geospatial queries
- **Location Validation**: Ensure valid coordinate ranges

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library for building interactive interfaces |
| **React Router DOM** | Client-side routing and navigation |
| **Axios** | HTTP client for API requests |
| **Leaflet** | Interactive map rendering |
| **React Leaflet** | React bindings for Leaflet |
| **CSS3** | Custom styling and animations |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database with geospatial support |
| **Mongoose** | MongoDB object modeling |
| **JWT** | Secure token-based authentication |
| **bcrypt.js** | Password hashing and comparison |
| **Multer** | Multipart form data and file uploads |
| **Express Validator** | Input validation middleware |

### Additional Tools
- **Nominatim API**: Reverse geocoding service
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management


## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cluster)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nithin345256/HelpHim.git
   cd HelpHim
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Create environment variables**

   Create a `.env` file in the `backend` directory:
   ```bash
   # Backend/.env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/issuebridge
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/issuebridge

   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

5. **Create uploads directory**
   ```bash
   cd backend
   mkdir uploads
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm start
   # or for development with nodemon
   npm run dev
   ```

3. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:4000`

### Default Test Accounts

**User Account:**
- Email: `user@test.com`
- Password: `password123`
- Role: User

**Officer Account:**
- Email: `officer@test.com`
- Password: `password123`
- Role: Officer
- Specialization: Water Issue

## 📁 Project Structure

HelpHim/
│
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   │
│   ├── controllers/
│   │   ├── Issue.js        # Authentication logic
│   │   └── authController.js       # Issue CRUD operations
│   │
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   └── Issue.js                 # Issue schema
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT authentication
│   │   ├── uploadMiddleware.js      # File upload handling
│   │   ├── validateMiddleware.js    # Input validation
│   │   └── validateIssue.js         # Issue validation
│   │
│   ├── routes/
│   │   ├── Issue.js            # Auth endpoints
│   │   └── auth.js           # Issue endpoints
│   │
│   ├── uploads/                     # Uploaded images
│   ├── .env                         # Environment variables
│   ├── server.js                    # Express app setup
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── FrontPage.jsx        # Public landing page
│   │   │   ├── FrontPage.css        # FrontPage styles
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── Login.css            # Login styles
│   │   │   ├── Register.jsx         # Registration form
│   │   │   ├── Register.css         # Registration styles
│   │   │   ├── UserDashboard.jsx    # User dashboard
│   │   │   ├── UserDashboard.css    # User dashboard styles
│   │   │   ├── OfficerDashboard.jsx # Officer dashboard
│   │   │   └── OfficerDashboard.css # Officer dashboard styles
│   │   │
│   │   ├── App.js                   # Main app component
│   │   ├── index.js                 # Entry point
│   │   └── routes.js                # Route configuration
│   │
│   └── package.json
│
├── README.md
├── .gitignore
└── LICENSE
```


## 👤 User Roles

### 🧑 User (Citizen)
**Capabilities:**
- Register and login to the platform
- Report new issues with photos and location
- View and edit their own issues
- Delete their own issues
- Track status of reported issues
- View dashboard with statistics
- View all personal issues in one place

**Restrictions:**
- Cannot update issue status
- Cannot view issues from other users (only public issues)
- Cannot access officer dashboard

### 👮 Officer (Municipal Staff)
**Capabilities:**
- All user capabilities
- View issues specific to their specialization
- Update issue status (Pending → In Progress → Resolved)
- Access specialized officer dashboard
- Filter issues by status
- View issue location and details

**Restrictions:**
- Can only update issues in their specialization area
- Cannot delete issues
- Cannot change issue specialization

**Specializations:**
- Water Issue
- Sanitation
- Pothole
- Garbage
- Traffic
- Other

### 👑 Admin (System Administrator)
**Capabilities:**
- All officer capabilities
- View all issues regardless of specialization
- Update any issue
- Delete any issue
- Access to all dashboards
- Manage user roles (future feature)

## 🔐 Environment Variables

### Backend (.env)

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/issuebridge
# MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/issuebridge?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_256_bit_secret_key_change_in_production
JWT_EXPIRE=1d

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_UPLOADS_URL=http://localhost:4000/uploads

# Map Configuration
REACT_APP_MAP_CENTER_LAT=12.9716
REACT_APP_MAP_CENTER_LNG=77.5946
REACT_APP_MAP_ZOOM=13
```

## 🚢 Deployment

### Backend Deployment (Heroku)

1. **Prepare for deployment**
   ```bash
   # Create Procfile
   echo "web: node server.js" > Procfile
   ```

2. **Deploy to Heroku**
   ```bash
   heroku create issuebridge-api
   heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
   heroku config:set JWT_SECRET="your_secret_key"
   git push heroku main
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build the app**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/issuebridge
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🐛 Known Issues & Limitations

1. **File Upload Size**: Limited to 5MB per image
2. **Geolocation**: Requires HTTPS for production getCurrentLocation
3. **Anonymous Sessions**: Session IDs stored in localStorage
4. **Real-time Updates**: No WebSocket integration (polling required)
5. **Image Optimization**: No automatic compression
6. **Map Markers**: Limited to 100 visible markers

## 🗺️ Roadmap

- [ ] Real-time notifications with Socket.io
- [ ] Image compression and optimization
- [ ] Advanced search and filtering
- [ ] Issue priority levels
- [ ] Multi-language support
- [ ] Mobile apps (React Native)
- [ ] Analytics dashboard for admins
- [ ] Email notifications
- [ ] CSV export functionality
- [ ] Public API documentation
- [ ] Integration with government systems
- [ ] Chatbot support
- [ ] Dark mode

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Coding Standards

- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Write unit tests for new functionality
