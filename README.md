🌉 HelpHim — Community Issue Reporting Platform
A MERN stack app that lets citizens report civic issues and municipal officers track & resolve them.
Features

📍 Report issues with photos and GPS location via interactive map
👤 Role-based access — Citizens, Officers, Admins
🗺️ Officer dashboard filtered by specialization (Water, Sanitation, Pothole, etc.)
💬 Public feed with likes and anonymous comments
🔐 JWT authentication with bcrypt password hashing

Tech Stack
Frontend: React, React Router, Leaflet Maps, Axios
Backend: Node.js, Express.js, MongoDB, Mongoose, Multer
Auth: JWT + bcrypt
Getting Started
bash# Clone & install
git clone https://github.com/Nithin345256/HelpHim.git
cd HelpHim

cd backend && npm install
cd ../frontend && npm install
```

Create `backend/.env`:
```
PORT=4000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
bash# Run backend
cd backend && npm start

# Run frontend
cd frontend && npm start

Frontend: http://localhost:3000
Backend API: http://localhost:4000

User Roles
RoleCan DoUserReport, edit, delete own issuesOfficerUpdate status on issues in their specializationAdminFull access to all issues
License
MIT
