# Smart Attendance App — Setup Guide

## Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Anthropic API key (for AI suggestions)

---

## 1. Clone / Navigate into the project

```bash
cd smart-attendance-app
```

---

## 2. Backend Setup

```bash
cd server
npm install
```

Copy the env example and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smart-attendance
JWT_SECRET=any_long_random_string
JWT_REFRESH_SECRET=another_long_random_string
ANTHROPIC_API_KEY=sk-ant-...
CLIENT_URL=http://localhost:5173
PORT=5000
```

Seed demo data (optional):

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

Server runs at **http://localhost:5000**

---

## 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Demo Login Credentials

After running the seed script:

| Role    | Email               | Password  |
|---------|---------------------|-----------|
| Student | student@demo.com    | demo1234  |
| Teacher | teacher@demo.com    | demo1234  |
| Admin   | admin@demo.com      | demo1234  |

---

## Key Features by Role

### Student
- **Dashboard** — Today's schedule, attendance %, productivity score
- **QR Scanner** — Scan teacher's QR to mark attendance
- **Attendance History** — Subject-wise records and percentages
- **Suggestions** — AI-generated free-period tasks (via Claude API)
- **Daily Routine** — Auto-built from timetable, track tasks
- **Goals** — Create goals with milestones and track progress
- **Profile** — Update interests/career goals for better suggestions

### Teacher
- **Live Attendance** — Generate QR code, see real-time attendance via Socket.IO
- **Reports** — Filter attendance by date/subject, view trends chart

### Admin
- **Manage Timetables** — Create/delete timetable entries for any dept/semester
- **Reports** — Institution-wide attendance analytics

---

## Architecture

```
server/
├── config/        db.js, jwt.js
├── models/        User, Timetable, Attendance, Suggestion, Goal, Routine
├── routes/        auth, timetable, attendance, suggestions, goals, routine
├── controllers/   one per route group
├── middleware/    authMiddleware, roleGuard
├── services/      qrService.js (QR sessions), aiService.js (Claude API)
└── utils/         response.js, dateHelpers.js, seed.js

client/src/
├── context/       AuthContext, SocketContext
├── services/      api.js (axios + auto-refresh), socketClient.js
├── pages/         student/, teacher/, admin/, auth/
└── components/    AppLayout, LoadingScreen
```
