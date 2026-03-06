🚀 Job Tracker SaaS

A full-stack Job Application Management Platform that helps users track job applications, manage interview schedules, analyze job search performance, and organize job-related notes.

This project simulates a real SaaS dashboard used by job seekers to manage their job search efficiently.

🖥️ Demo Overview

The platform allows users to:

Track job applications

Organize applications using a drag-and-drop pipeline

Schedule and view interviews in a calendar

Analyze job search performance using analytics dashboards

Maintain notes for each job application

Manage profile and authentication

✨ Features
🔐 Authentication

User Registration

Login with JWT authentication

Password hashing using bcrypt

Secure route protection using middleware

📊 Dashboard

Displays an overview of job search progress:

Total Applications

Interviews

Offers

Rejections

Real-time statistics update based on user data.

📌 Job Management

Users can:

Add new job applications

Edit job details

Delete applications

Add notes for each job

Track application status

Example fields:

Role
Company
Status
Notes
Interview Date
🧩 Applications Pipeline (Kanban Board)

Interactive drag-and-drop job pipeline similar to Trello.

Stages include:

Applied
Interview
Offer
Rejected

Users can drag job cards between stages to update application status.

Built using:

DnD Kit (Drag and Drop)
📈 Analytics Dashboard

Visualizes job search progress using charts.

Includes:

Donut Chart for application distribution

Bar Chart for status comparison

Summary statistics cards

Charts built using:

Recharts
📅 Interview Calendar

Users can schedule and view interviews in a calendar interface.

Features:

Monthly calendar view

Displays company + role for each interview

Automatically syncs with job entries

Built using:

React Big Calendar
📝 Notes System

Users can attach notes to job applications.

Example uses:

Interview preparation

Company research

Technical topics to review

👤 Profile Management

Users can:

View profile information

Update email

Change password securely

🏗️ Tech Stack
Frontend
React
Vite
React Router
DnD Kit
Recharts
React Big Calendar
Axios
Backend
Node.js
Express.js
JWT Authentication
bcrypt
Database
SQLite
Prisma ORM
📂 Project Structure
job-tracker-saas
│
├── client
│   ├── components
│   ├── pages
│   │   ├── app
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Applications.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Calendar.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   └── public
│   │       ├── Login.jsx
│   │       └── Register.jsx
│
├── server
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── prisma
│
└── README.md
⚙️ Installation
Clone Repository
git clone https://github.com/yourusername/job-tracker-saas.git
Backend Setup
cd server
npm install
npx prisma migrate dev
npm run dev
Frontend Setup
cd client
npm install
npm run dev
📊 Key Learning Outcomes

This project demonstrates:

Full-stack application development

REST API design

Authentication and authorization

Database management using Prisma

Interactive UI with drag-and-drop systems

Data visualization dashboards

Calendar-based scheduling systems

🚀 Future Improvements

Possible upgrades include:

Email notifications for upcoming interviews

Resume upload and version tracking

AI-based job application insights

Automated recruiter follow-up reminders

Dark/light theme switching

👨‍💻 Author

Aniket Kumar

GitHub

https://github.com/Aniketkr19
