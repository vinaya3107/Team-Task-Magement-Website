# TaskFlow — Team Task Manager

A full-stack, production-ready team task management application built with **React + Vite**, **Node.js + Express**, and **PostgreSQL**.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 Auth | JWT-based login/signup + bcrypt password hashing |
| 👥 RBAC | ADMIN (full access) / MEMBER (scoped access) |
| 📁 Projects | Create, edit, delete, search, paginate |
| ✅ Tasks | Full CRUD, status tracking, due dates, overdue detection |
| 📊 Dashboard | Stats cards, status breakdown, recent tasks |
| 🔍 Search & Filter | Task/project search + status filter |
| 📄 Pagination | Server-side pagination on all list views |
| 🔔 Toasts | react-hot-toast notifications throughout |
| 🎨 UI | Dark mode glassmorphism design with animations |

---

## 🏗 Tech Stack

- **Frontend**: React 18 + Vite, react-router-dom, react-hook-form, axios, react-hot-toast
- **Backend**: Node.js, Express, express-validator, helmet, morgan
- **Database**: PostgreSQL (pg)
- **Auth**: JWT + bcrypt

---

## 📂 Project Structure

```
Team Task Manager/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/   (auth, project, task, dashboard)
│   │   ├── middleware/    (auth, rbac, validate, errorHandler)
│   │   ├── routes/        (auth, projects, tasks, dashboard, users)
│   │   └── validators/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── components/    (Layout, common, projects, tasks)
│   │   ├── contexts/AuthContext.jsx
│   │   ├── pages/         (Login, Signup, Dashboard, Projects, ProjectDetails, Tasks, Users)
│   │   └── utils/helpers.js
│   └── package.json
└── schema.sql
```

---

## 🚀 Local Setup

### 1. PostgreSQL Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE teamtaskmanager;"

# Run schema
psql -U postgres -d teamtaskmanager -f schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT_SECRET
npm install
npm run dev       # runs on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # runs on http://localhost:5173
```

Open **http://localhost:5173** → Login with Admin credentials (Email: `admin@example.com` / Password: `admin123`) → create members, projects & tasks.

---

## 🌐 Deployment

### Backend → Railway

1. Push `backend/` to a GitHub repo
2. Create a new Railway project → **Deploy from GitHub**
3. Add a **PostgreSQL** plugin in Railway
4. Set environment variables:
   ```
   DATABASE_URL   = (auto-filled by Railway plugin)
   JWT_SECRET     = <strong-random-string>
   NODE_ENV       = production
   CORS_ORIGIN    = https://your-frontend.vercel.app
   ```
5. Run schema: use Railway's DB shell → `psql $DATABASE_URL -f schema.sql`
6. Railway auto-detects `npm start` from `package.json`

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import into Vercel → framework: **Vite**
3. Set environment variable:
   ```
   VITE_API_URL = https://your-backend.railway.app/api
   ```
4. Deploy → Vercel auto-builds with `npm run build`

---

## 🔑 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Role |
|--------|----------|------|
| GET    | `/api/projects` | All |
| POST   | `/api/projects` | Admin |
| PUT    | `/api/projects/:id` | Admin |
| DELETE | `/api/projects/:id` | Admin |
| POST   | `/api/projects/:id/members` | Admin |
| DELETE | `/api/projects/:id/members/:uid` | Admin |

### Tasks
| Method | Endpoint | Role |
|--------|----------|------|
| GET    | `/api/tasks?status=&search=&page=` | All |
| POST   | `/api/tasks` | Admin |
| PUT    | `/api/tasks/:id` | Admin / Assignee |
| DELETE | `/api/tasks/:id` | Admin |

### Dashboard & Users
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/dashboard` | All |
| GET | `/api/users` | Admin |

---

## 🛡 RBAC Summary

| Action | ADMIN | MEMBER |
|--------|-------|--------|
| Create/Edit/Delete Projects | ✅ | ❌ |
| Manage Project Members | ✅ | ❌ |
| Create/Delete Tasks | ✅ | ❌ |
| Update Task Status | ✅ | ✅ (own tasks) |
| View Dashboard | ✅ (all) | ✅ (own scope) |
| View Users | ✅ | ❌ |

---

## 🎬 Demo Script

1. **Login as ADMIN** (Email: `admin@example.com`, Password: `admin123`) → Dashboard shows empty stats
2. **Create a Project** → Projects page → "+ New Project"
3. **Add Members** → Project Details → add by email
4. **Create Tasks** → Assign to members, set due dates
5. **Login as MEMBER** → Dashboard shows only their tasks
6. **Update Task Status** → Member can move Todo → In Progress → Done
7. **Filter Tasks** → Use search + status filter on Tasks page

---

## 📄 License

MIT © TaskFlow Team
