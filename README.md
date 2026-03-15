# JobTracker SaaS

A full-stack job application tracking platform built with React, Express, Prisma, and SQLite. Track your job applications, manage resumes, and stay organized during your job search.

---

## 🚀 Features

- **Dashboard** — Stats overview, upcoming interviews, recent activity feed
- **Applications Pipeline** — Kanban board with drag-and-drop status management
- **Documents** — Upload and organize resumes by role (stored on server)
- **Settings** — Preferences, dashboard customization, password change, data export
- **Profile** — Avatar upload, name update, account management
- **Chrome Extension** — Save jobs from Naukri, Indeed, LinkedIn, Wellfound, Glassdoor, Internshala with one click
- **Dark / Light Mode** — Toggle between themes, persists across sessions
- **JWT Authentication** — Secure login with token-based auth

---

## 🛠 Tech Stack

### Frontend
- React 18 + Vite
- React Router v6
- Axios
- @dnd-kit (drag and drop)
- Lucide React (icons)

### Backend
- Node.js + Express
- Prisma ORM
- SQLite (local) → PostgreSQL (production)
- Multer (file uploads)
- JWT + bcrypt (auth)

---

## 📁 Project Structure

```
job-tracker/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       # Axios instance with auth interceptor
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx    # Main layout with topbar + sidebar
│   │   │   │   └── Sidebar.jsx      # Navigation sidebar
│   │   │   └── ui/
│   │   ├── pages/
│   │   │   ├── app/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Applications.jsx
│   │   │   │   ├── Documents.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   └── Profile.jsx
│   │   │   └── public/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   └── App.jsx
│   └── package.json
│
├── server/                    # Express backend
│   ├── controllers/
│   │   ├── userController.js  # Auth + job + avatar functions
│   │   └── documentController.js  # Document upload/download
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── prisma/
│   │   ├── schema.prisma      # Database models
│   │   └── migrations/
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   └── documentRoutes.js
│   ├── uploads/               # Uploaded files (gitignored)
│   ├── index.js               # Express server entry
│   └── package.json
│
├── jobtracker-extension/      # Chrome extension
│   ├── manifest.json
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   └── background.js
│
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repo
```bash
git clone https://github.com/Aniketkr19/job-tracker-saas.git
cd job-tracker-saas
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key_here"
```

Run database migrations:
```bash
npx prisma migrate dev
```

Start the server:
```bash
node index.js
```
Server runs on **http://localhost:5000**

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

---

## 🔌 Chrome Extension Setup

1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `jobtracker-extension/` folder
5. Click the **J** icon in toolbar → Login with your account
6. Visit any job on Naukri, Indeed, LinkedIn etc.
7. Click **＋ Save this Job** button that appears on the page

### Supported Job Sites
- Naukri.com
- Indeed.com
- LinkedIn.com
- Wellfound.com
- Glassdoor.com
- Internshala.com

---

## 🗄️ Database Schema

```prisma
model User {
  id        Int        @id @default(autoincrement())
  name      String
  email     String     @unique
  password  String
  avatarUrl String?
  createdAt DateTime   @default(now())
  jobs      Job[]
  documents Document[]
}

model Job {
  id            Int       @id @default(autoincrement())
  title         String
  company       String
  status        String    # Applied | Interview | Offer | Rejected
  userId        Int
  notes         String?
  location      String?
  description   String?
  sourceUrl     String?
  interviewDate DateTime?
  createdAt     DateTime  @default(now())
}

model Document {
  id        Int      @id @default(autoincrement())
  userId    Int
  name      String
  fileName  String
  filePath  String
  fileType  String
  fileSize  Int
  role      String   @default("General")
  createdAt DateTime @default(now())
}
```

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login + get JWT token |
| GET | `/api/users/profile` | Get logged-in user profile |
| PUT | `/api/users/change-password` | Change password |
| PUT | `/api/users/update-name` | Update display name |
| PUT | `/api/users/upload-avatar` | Upload profile photo |
| DELETE | `/api/users/delete-account` | Delete account |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs for user |
| POST | `/api/jobs` | Add new job |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | Get all documents for user |
| POST | `/api/documents/upload` | Upload documents (multipart) |
| PUT | `/api/documents/:id` | Rename or change role |
| DELETE | `/api/documents/:id` | Delete document |
| GET | `/api/documents/:id/download` | Download document |

---

## 🚀 Deployment

> Coming soon — Railway (backend) + Vercel (frontend) + PostgreSQL

---

## 📸 Screenshots

> Add screenshots here after deployment

---

## 📝 License

MIT
