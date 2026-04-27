<div align="center">

# 🌐 Unisphere
### *One platform for every club, every event, every student.*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

</div>

---

## 📖 About the Project

Unisphere is a unified university platform that solves the three biggest pain points in campus life: **club discovery, event awareness, and communication chaos.** Every university has dozens of clubs and events, yet students — especially freshers — routinely miss out because there is no single, structured place to find, join, and engage with them.

Unisphere replaces scattered WhatsApp groups, paper flyers, and word-of-mouth with a structured, approval-gated, interest-driven platform. It serves three core users equally: students discovering campus life, club admins managing memberships and events, and faculty advisors maintaining institutional oversight.

> **The Core Insight:** University club and event management is broken not because of lack of interest — but because of lack of infrastructure. Unisphere is that infrastructure.

### The Problem

| # | Problem | Impact |
|---|---------|--------|
| 1 | **Poor Discovery** | Freshers have no structured way to find clubs matching their interests. They rely on orientation fairs or word of mouth. |
| 2 | **Missed Events** | Students learn about events after they happen. No centralized, real-time event feed exists for campus activities. |
| 3 | **Registration Friction** | Event sign-ups involve manual forms, spreadsheets, or in-person queues — creating friction and lost sign-ups. |
| 4 | **Communication Chaos** | Post-event communication lives in WhatsApp groups that never get deleted, creating notification chaos and dead groups. |

---

## ✨ Key Features

### 🎯 Interest-Based Club Discovery
Students select interest tags on signup. Unisphere surfaces a curated, relevance-ranked shortlist of clubs instantly — the highest-impact moment for freshers. One-click join. No forms.

### 📅 Event Lifecycle & Approval Workflow
Every event is faculty-gated before going live:
```
📝 Draft  →  ⏳ Pending Review  →  ✅ Approved  →  🎉 Active  →  🔒 Closed
```
Club admins create events. Faculty advisors approve or reject with written reasons. Only approved events are visible for registration.

### 💬 Auto-Dissolving Event Group Chats
When a student registers for an event, they are automatically added to a two-way group chat for that event. The group auto-archives **7 days post-event** via a background job — eliminating dead groups permanently.

### 📊 Student Dashboard
A unified home for campus life — upcoming registered events, joined clubs, active group chats, and smart notifications from joined clubs only.

### 🔔 Push Notifications
Relevant alerts only: new events from joined clubs, approval/rejection status, registration confirmation, and group-dissolving warnings. Powered by Firebase Cloud Messaging.

### 👨‍🏫 Faculty Approval System
Every club is mandatorily linked to a faculty advisor — no club can exist without one. Advisors get a dedicated dashboard to review pending events with approve/reject + written feedback.

### 🔧 Super Admin Panel
University-level controls: club verification, faculty advisor management, university onboarding, and platform-wide oversight.

---

## 🖼️ Screenshots

> *Add screenshots here. Create a `/screenshots` folder in the repo, drop in images, and update the paths below.*

| Student Dashboard | Club Discovery | Event Flow |
|:-:|:-:|:-:|
| ![Dashboard](./screenshots/dashboard.png) | ![Clubs](./screenshots/clubs.png) | ![Events](./screenshots/events.png) |

| Group Chat | Faculty Panel | Super Admin |
|:-:|:-:|:-:|
| ![Chat](./screenshots/chat.png) | ![Faculty](./screenshots/faculty.png) | ![Admin](./screenshots/admin.png) |

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js | UI framework |
| Tailwind CSS | Utility-first styling & responsive layout |
| Framer Motion | Animations & page transitions |
| React Router v6 | Client-side routing |
| Axios | HTTP API requests |
| Socket.io-client | Real-time group chat |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database & schema validation |
| Socket.io | Real-time bidirectional messaging |
| BullMQ + Redis | Background jobs for auto-group dissolution |
| Firebase Admin SDK | Push notifications via FCM |
| JSON Web Tokens | Stateless authentication |
| bcrypt.js | Password hashing |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `v18+`
- [MongoDB](https://www.mongodb.com/) (local or [Atlas](https://cloud.mongodb.com/))
- [Redis](https://redis.io/) — required for BullMQ group-dissolution jobs
- [Git](https://git-scm.com/)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/rohit6709/Unisphere.git
cd Unisphere
```

**2. Setup the Backend**
```bash
cd backend
npm install
```

Create a `.env` file inside `/backend`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# University
ALLOWED_EMAIL_DOMAIN=youruniversity.edu
```

**3. Setup the Frontend**
```bash
cd ../frontend
npm install
```

Create a `.env` file inside `/frontend`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the App

```bash
# Terminal 1 — Redis (required for background jobs)
redis-server

# Terminal 2 — Backend
cd backend && npm run dev

# Terminal 3 — Frontend
cd frontend && npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000/api` |

---

## 🔒 Security Protocols

### 🔑 JWT Authentication
All protected routes require a valid JSON Web Token in the `Authorization` header. Tokens are signed with a private secret, carry an expiry (`JWT_EXPIRES_IN`), and are verified by `auth.middleware.js` on every request before any business logic runs. Fully stateless — no server-side sessions.

### 🔐 Password Hashing — bcrypt
Passwords are never stored in plain text. Every password is hashed with `bcrypt` at a salt round of `10` before being written to the database. Comparison always uses `bcrypt.compare()`. A database breach cannot expose user passwords.

### 👥 Role-Based Access Control
Four roles — `student`, `clubAdmin`, `facultyAdvisor`, `superAdmin` — with permissions enforced by middleware before controllers are reached:

| Action | Student | Club Admin | Faculty Advisor | Super Admin |
|--------|:-------:|:----------:|:---------------:|:-----------:|
| Join a club | ✅ | — | — | — |
| Create an event | ❌ | ✅ | ❌ | ❌ |
| Approve / reject events | ❌ | ❌ | ✅ | ❌ |
| Verify clubs | ❌ | ❌ | ❌ | ✅ |
| Platform-wide access | ❌ | ❌ | ❌ | ✅ |

Role is assigned at registration, embedded in the JWT payload, and re-verified on every protected route.

### 🛡️ Input Validation & Sanitization
All incoming request payloads are validated server-side before processing. Malformed or missing fields return descriptive errors without exposing stack traces or internal logic. University email domain is validated at the API level — only enrolled students can register.

### ⏱️ Rate Limiting
Authentication endpoints are rate-limited to prevent brute-force attacks on login and registration.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>🌐 Unisphere • V1.0 • University Club & Event Management Platform</sub>
</div>