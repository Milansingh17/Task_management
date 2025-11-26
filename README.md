## Task Management Platform

A full-stack task and workflow platform built with **Django REST Framework** and **React**.  
It provides secure JWT authentication, rich task CRUD, analytics, audit logging, role-aware views, and real-time collaboration via WebSockets with a modern Tailwind UI (light/dark mode).

---

## Quick Start

1. **Clone & enter project**

   ```bash
   git clone <your-repo-url>
   cd <project-root>
   ```

2. **Start backend**

   ```bash
   cd backend/task_management
   python -m venv .venv
   .venv\Scripts\activate          # Windows
   pip install -r ../requirements.txt
   python manage.py migrate
   python manage.py runserver      # http://localhost:8000
   ```

3. **Start frontend**

   ```bash
   cd ../../frontend
   npm install
   npm start                       # http://localhost:3000
   ```

4. **Open app**

   - Visit `http://localhost:3000`
   - Register or log in
   - Start creating and managing tasks in real time

---

## Feature Highlights

- **Authentication & Security**: SimpleJWT login/register/logout, profile management, refresh token rotation, admin-only APIs.
- **Task Engine**: Ownership-aware CRUD, filtering, sorting, search, drag-and-drop ordering, pagination, status/priority toggles.
- **Analytics**: `/api/tasks/summary/` metrics and staff dashboards at `/api/tasks/admin/overview/` with charts in the frontend.
- **Audit & Activity**: Signal-driven audit trail with `/api/logs/` endpoint and a UI timeline.
- **Real-Time Collaboration**: Django Channels WebSocket stream (`/ws/tasks/`) pushes task mutations and summary deltas into the React dashboard.
- **UX Enhancements**: Toast notifications, skeleton/loading states, form validation, dark mode, keyboard accessibility, responsive layout.

---

## Architecture Overview

- **Backend (`backend/`)**: Django 5 + DRF for REST APIs, JWT auth, background signals, audit logging, admin analytics, and Channels WebSocket consumers.
- **Frontend (`frontend/`)**: React 18 app with React Router, Context for auth/theme, Tailwind CSS, Chart.js, and reusable UI components.
- **Communication**: REST over HTTP(S) for CRUD + analytics, WebSockets for live task updates, Axios interceptors for token refresh, toast-based feedback in the client.

```text
client (React) <--> Django REST API (tasks/auth/logs)
          ↘              ↗
           WebSocket (Channels) for live updates
```

---

## Project Structure

```text
.
├─ backend/
│  ├─ manage.py
│  ├─ task_management/        # Django project (settings, urls, asgi)
│  └─ apps/...                # Tasks, logs, analytics, users
├─ frontend/
│  ├─ src/
│  │  ├─ api/                 # Axios wrappers
│  │  ├─ components/          # Auth, tasks, layout, common UI
│  │  ├─ pages/               # Login, Register, Dashboard, Analytics, Admin
│  │  └─ hooks/context/utils
│  └─ public/
├─ requirements.txt
└─ README.md
```

---

## Tech Stack

| Layer    | Stack                                                                                         |
| -------- | --------------------------------------------------------------------------------------------- |
| Backend  | Django 5, Django REST Framework, SimpleJWT, Django Channels, django-filter, drf-yasg          |
| Frontend | React 18, React Router 6, Tailwind CSS, react-beautiful-dnd, react-chartjs-2, react-hot-toast |
| Tooling  | Axios interceptors, WebSocket helpers, Python virtualenv, npm scripts                         |

---

## Configuration

### Backend Environment (`backend/task_management/.env`)

Create `.env` (or copy from `.env.example` if present):

```text
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite by default; uncomment to switch to Postgres)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

ACCESS_TOKEN_LIFETIME=60
REFRESH_TOKEN_LIFETIME=1440
```

`psycopg2-binary` is already included in `requirements.txt`; adjust the DB\_\* values to match your server before running migrations.

### Frontend Environment (`frontend/.env`)

```text
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000
```

When running commands, ensure you are inside the correct folder (`frontend` for npm, `backend/task_management` for Django) to avoid ENOENT errors.

---

## Running the Full Stack (Local)

1. Start the Django server: `python manage.py runserver` (inside `backend/task_management`).
2. In a separate terminal, run the React dev server: `npm start` (inside `frontend`).
3. Register or log in.
4. Explore dashboard, analytics, admin panel, and activity log.

---

## API Highlights

| Area  | Method & Path                           | Description                            |
| ----- | --------------------------------------- | -------------------------------------- |
| Auth  | `POST /api/auth/register/`              | Create user and issue tokens           |
|       | `POST /api/auth/login/`                 | Obtain JWT pair                        |
|       | `POST /api/auth/logout/`                | Optional refresh blacklist             |
|       | `POST /api/auth/token/refresh/`         | Rotate access token                    |
|       | `GET/PATCH /api/auth/profile/`          | Retrieve or update current user        |
| Tasks | `GET/POST /api/tasks/`                  | Filterable, searchable, paginated CRUD |
|       | `GET/PUT/PATCH/DELETE /api/tasks/{id}/` | Owner-guarded detail operations        |
|       | `POST /api/tasks/reorder/`              | Persist drag-and-drop ordering         |
|       | `GET /api/tasks/summary/`               | Counts for analytics cards             |
|       | `GET /api/tasks/admin/overview/`        | Staff-only insights                    |
| Logs  | `GET /api/logs/`                        | Paginated audit trail                  |
| WS    | `WS /ws/tasks/?token=<access>`          | Live task + summary events             |

Responses use JSON exclusively with consistent success/error envelopes.

---

## Deployment Notes

### Backend (Render example)

- **Service type**: Python / Django
- **Build/start**:

  ```bash
  pip install -r backend/requirements.txt
  cd backend/task_management
  gunicorn task_management.wsgi:application --bind 0.0.0.0:$PORT
  ```

- **Environment variables (Render → Settings → Environment)**:
  - `SECRET_KEY` – strong random string
  - `DEBUG` – `False`
  - `DATABASE_URL` – Render Postgres URL (or your own)
  - `ACCESS_TOKEN_LIFETIME` – e.g. `60`
  - `REFRESH_TOKEN_LIFETIME` – e.g. `1440`

The project expects the backend to be reachable at something like `https://task-management-4-bzj0.onrender.com`.

API routes are always under `/api/...`, for example:

- `POST https://task-management-4-bzj0.onrender.com/api/auth/register/`
- `POST https://task-management-4-bzj0.onrender.com/api/auth/login/`
- `GET  https://task-management-4-bzj0.onrender.com/api/tasks/`

If you see 404s such as `/auth/register/` (missing `/api`), check the frontend `REACT_APP_API_URL`.

### Frontend (Vercel example)

- **Build command**: `npm run build`
- **Output directory**: `frontend/build`
- **Environment variables**:

  ```bash
  REACT_APP_API_URL=https://task-management-4-bzj0.onrender.com/api
  REACT_APP_WS_URL=wss://task-management-4-bzj0.onrender.com
  ```

After setting these, rebuild and redeploy. In the browser DevTools Network tab, verify calls go to:

- `/api/auth/register/`, `/api/auth/login/`
- `/api/tasks/`, `/api/logs/`

and that the WebSocket connects to:

- `wss://task-management-4-bzj0.onrender.com/ws/tasks/?token=<access_token>`

---

## Frontend Screens

- **Login / Register**: Validation, accessible labels, secure credential storage.
- **Dashboard**: Filters, search, pagination, drag-and-drop ordering, inline status switches, and real-time counters.
- **Task Form**: Reusable create/edit experience with client-side validation.
- **Analytics**: Chart.js visualizations for priority and status.
- **Activity Log**: Paginated audit entries that explain what changed.
- **Admin Panel**: Staff-only overview of trends, top contributors, and recent actions.

---

## Testing & Quality

- Backend: `python manage.py test`
- Frontend: `npm test`
- Styling and structure follow Django/DRF conventions and Tailwind class ordering.

---

## Real-Time & Audit Details

- Django signals (`post_save`, `pre_delete`, `post_delete`) emit audit entries for every task mutation, including status/priority transitions.
- Channels broadcasts structured payloads (`task_created`, `task_updated`, `task_summary`, `tasks_reordered`) consumed by the React WebSocket hook.
- The React app reconciles incoming events to keep lists, counts, and analytics in sync without manual refresh.

---

## Ready for Development

With both servers running, visit `http://localhost:3000`, review the built-in Swagger docs at `http://localhost:8000/swagger/`, and start managing tasks with real-time collaboration.
