# 📚 Smart Attendance System

A full-stack **Smart Attendance Management System** designed for educational institutions. This app simplifies attendance tracking using QR codes, provides insightful analytics, and enhances student productivity .

---

## 🚀 Features

### 👨‍🎓 Student

* **Dashboard** — View today's schedule, attendance percentage, and productivity score
* **QR Scanner** — Scan teacher-generated QR codes to mark attendance
* **Attendance History** — Subject-wise attendance records with percentages
* **Suggestions** — AI-powered free-period task suggestions *(via Claude API)*
* **Daily Routine** — Auto-generated routine based on timetable
* **Goals** — Set goals, track milestones, and monitor progress
* **Profile** — Update interests and career goals for personalized suggestions

---

### 👨‍🏫 Teacher

* **Live Attendance** — Generate QR codes and track attendance in real-time *(via Socket.IO)*
* **Reports** — Filter attendance by subject/date and visualize trends

---

### 🛠️ Admin

* **Manage Timetables** — Create and manage timetable entries by department/semester
* **Reports** — Institution-wide analytics and attendance insights

---

## 🏗️ Architecture

```
server/
├── config/        # Database & JWT configuration
├── models/        # Mongoose models (User, Timetable, Attendance, etc.)
├── routes/        # API routes
├── controllers/   # Business logic for each route
├── middleware/    # Authentication & role-based access
├── services/      # QR handling & AI integration
└── utils/         # Helper functions

client/src/
├── context/       # Global state (Auth, Socket)
├── services/      # API & socket client
├── pages/         # Role-based pages (student, teacher, admin)
└── components/    # Reusable UI components
```

---

## 🧑‍💻 Tech Stack

### Frontend

* React.js
* Context API
* Axios
* Socket.IO Client

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Socket.IO

### Other Tools

* JWT Authentication
* QR Code Generation
* Claude API (AI Suggestions)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/smart-attendance.git
cd smart-attendance
```

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLAUDE_API_KEY=your_api_key
```

Run server:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd client
npm install
npm start
```

---

## 🔐 Authentication & Roles

* JWT-based authentication
* Role-based access control:

  * Student
  * Teacher
  * Admin

---

## 📡 Real-Time Features

* Live attendance tracking using **Socket.IO**
* Instant updates for teachers during QR scan sessions

---

## 📊 Future Enhancements

* 📱 Mobile App (React Native)
* 📍 GPS-based attendance validation
* 🤖 Advanced AI productivity tracking
* 📈 Predictive analytics for attendance trends

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Author

Developed by **Techno**
💻 Full Stack Developer

---

⭐ If you like this project, don't forget to give it a star!
