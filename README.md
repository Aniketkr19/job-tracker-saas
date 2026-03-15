# 🚀 Job Tracker SaaS

A full-stack Job Application Management Platform that helps users track job applications, manage resumes, organize documents, and stay on top of their job search — all from one dashboard.

This project simulates a real SaaS platform used by job seekers to manage their entire job search efficiently.

---

## 🖥️ Demo Overview

The platform allows users to:

- Track and manage job applications from one dashboard
- Drag and drop applications across pipeline stages
- Upload and organize resumes and documents by role
- Save jobs directly from job sites using a Chrome Extension
- Customize the dashboard and preferences via Settings
- Switch between Dark and Light mode
- Manage profile, avatar, and account security

---

## ✨ Features

### 🔐 Authentication
- User Registration and Login
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes using middleware
- Avatar upload and profile management

---

### 📊 Dashboard
Displays a complete overview of job search progress:

- Total Applications, Interviews, Offers, Rejections
- Response Rate calculation
- Upcoming Interviews panel
- Recent Activity feed
- Filter jobs by status (All / Applied / Interview / Offer / Rejected)
- Search jobs by title or company

---

### 📌 Job Management
Users can:

- Add new job applications manually
- Edit job details
- Delete applications
- Add notes and job descriptions
- Track application status
- Attach job posting URL

Example fields:

Role  
Company  
Location  
Status  
Notes  
Job Description  
Source URL  
Interview Date  

---

### 🧩 Applications Pipeline (Kanban Board)

Interactive drag-and-drop job pipeline similar to Trello.

Stages include:

Applied  
Interview  
Offer  
Rejected  

Users can drag job cards between stages to update application status.
Clicking a card opens a detail drawer with full job info and quick status change buttons.

Built using:

DnD Kit (Drag and Drop)

---

### 📁 Documents Manager

Users can upload and organize resumes and documents by role.

Features:

- Drag and drop file upload
- Tag documents with job roles (e.g. "Frontend Dev", "SDE-2")
- Filter documents by role
- Search documents by name
- Rename documents inline
- Download and delete documents
- Files stored securely on the server

---

### 🔌 Chrome Extension

Save jobs from popular job sites with one click.

Supported sites:

- Naukri.com
- Indeed.com
- LinkedIn.com
- Wellfound.com
- Glassdoor.com
- Internshala.com

Automatically extracts job title, company, location, description, and source URL.
Saved jobs appear on the dashboard instantly.

---

### ⚙️ Settings

- Preferred job roles and locations
- Expected salary range
- Job type preference (Full-time, Internship, Contract, etc.)
- Dashboard section visibility toggles
- Default filter selection
- Change password
- Export all jobs as CSV
- Clear rejected jobs
- Reset preferences

---

### 🌙 Dark / Light Mode

Toggle between dark and light themes from the top bar.
Theme preference persists across sessions using localStorage.

---

### 📈 Analytics Dashboard

Visualizes job search progress using charts.

Includes:

- Donut Chart for application distribution
- Bar Chart for status comparison
- Summary statistics cards

Charts built using:

Recharts

---

### 📅 Interview Calendar

Users can schedule and view interviews in a calendar interface.

Features:

- Monthly calendar view
- Displays company and role for each interview
- Automatically syncs with job entries

Built using:

React Big Calendar

---

### 👤 Profile Management

Users can:

- Upload and update profile avatar
- Update display name
- Change password securely
- Delete account

---

## 🏗️ Tech Stack

### Frontend

React 18  
Vite  
React Router v6  
DnD Kit (Drag and Drop)  
Recharts (Charts)  
React Big Calendar  
Axios  
Lucide React (Icons)  

---

### Backend

Node.js  
Express.js  
JWT Authentication  
bcrypt  
Multer (File Uploads)  

---

### Database

SQLite (Development)  
PostgreSQL (Production — coming soon)  
Prisma ORM  

---

## 📂 Project Structure

```
job-tracker-saas/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── ui/
│   │   └── pages/
│   │       ├── app/
│   │       │   ├── Dashboard.jsx
│   │       │   ├── Applications.jsx
│   │       │   ├── Documents.jsx
│   │       │   ├── Settings.jsx
│   │       │   ├── Analytics.jsx
│   │       │   ├── Calendar.jsx
│   │       │   └── Profile.jsx
│   │       └── public/
│   │           ├── Login.jsx
│   │           └── Register.jsx
│
├── server/
│   ├── controllers/
│   │   ├── userController.js
│   │   └── documentController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   └── documentRoutes.js
│   ├── uploads/
│   └── index.js
│
├── jobtracker-extension/
│   ├── manifest.json
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   └── background.js
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```
git clone https://github.com/Aniketkr19/job-tracker-saas.git
```

---

### Backend Setup

```
cd server
npm install
```

Create a `.env` file inside the `server/` folder:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key_here"
```

Run migrations and start server:

```
npx prisma migrate dev
node index.js
```

Server runs on http://localhost:5000

---

### Frontend Setup

```
cd client
npm install
npm run dev
```

Frontend runs on http://localhost:5173

---

### Chrome Extension Setup

1. Open Chrome and go to chrome://extensions
2. Enable Developer Mode (top right toggle)
3. Click Load unpacked
4. Select the jobtracker-extension folder
5. Click the J icon in the toolbar
6. Login with your JobTracker account
7. Visit any job listing on a supported site
8. Click the Save this Job button that appears on the page

---

## 🗄️ Database Schema

Models:

User — id, name, email, password, avatarUrl, createdAt  
Job — id, title, company, status, location, notes, description, sourceUrl, interviewDate, userId  
Document — id, name, fileName, filePath, fileType, fileSize, role, userId, createdAt  

---

## 🔐 API Endpoints

### Auth Routes
POST /api/users/register  
POST /api/users/login  
GET /api/users/profile  
PUT /api/users/change-password  
PUT /api/users/update-name  
PUT /api/users/upload-avatar  
DELETE /api/users/delete-account  

### Job Routes
GET /api/jobs  
POST /api/jobs  
PUT /api/jobs/:id  
DELETE /api/jobs/:id  

### Document Routes
GET /api/documents  
POST /api/documents/upload  
PUT /api/documents/:id  
DELETE /api/documents/:id  
GET /api/documents/:id/download  

---

## 📊 Key Learning Outcomes

This project demonstrates:

- Full-stack application development
- REST API design and implementation
- JWT Authentication and authorization
- Database management using Prisma ORM
- File upload handling with Multer
- Interactive UI with drag-and-drop systems
- Chrome Extension development
- Data visualization with Recharts
- Calendar-based scheduling
- Dark/Light theme implementation

---

## 🚀 Future Improvements

Possible upgrades include:

- PostgreSQL for production database
- Deploy backend on Railway
- Deploy frontend on Vercel
- Cloudinary for file storage
- Email notifications for upcoming interviews
- AI-based job application insights
- Automated recruiter follow-up reminders

---

## 👨‍💻 Author

Aniket Kumar

GitHub  
https://github.com/Aniketkr19

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
