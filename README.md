# Task Management Platform

Full-stack task management system built with Django REST Framework and React. It delivers secure JWT authentication, rich task CRUD features, audit logging, analytics, manual drag-and-drop ordering, real-time WebSocket updates, and an admin control panel – all wrapped in a responsive Tailwind UI with light/dark themes.

## Highlights
- SimpleJWT authentication with register/login/logout/profile flows
- Task API (ModelViewSet + ModelSerializer) with ownership enforcement
- Filtering by status/priority, search by title, ordering (including manual order), and page-number pagination
- Analytics endpoint (`/api/tasks/summary/`) + admin overview (`/api/tasks/admin/overview/`)
- Audit logs powered by Django signals (`post_save`, `pre_delete`, `post_delete`) with a paginated `/api/logs/` endpoint
- Real-time task + summary updates over WebSockets (`/ws/tasks/`) via Django Channels
- Drag & drop task ordering using `react-beautiful-dnd` persisted through the API
- Activity log page, analytics dashboard with charts, and staff-only admin panel
- Responsive React + Tailwind UI with reusable components, loading/error states, and dark mode

## Tech Stack
- **Backend:** Django 5, DRF, SimpleJWT, Channels, django-filter, drf-yasg
- **Frontend:** React 18, React Router 6, Tailwind CSS, react-beautiful-dnd, react-chartjs-2, react-hot-toast
- **Tooling:** Axios interceptors with refresh token handling, CORS, WebSocket helpers

## Getting Started

### Prerequisites
- Python 3.11+ (matches Pip installation location)
- Node.js 18+ and npm

### Backend Setup
```bash
cd backend/task_management
python -m venv .venv
.venv\Scripts\activate  # (Windows)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

### Backend (`.env` beside `manage.py`)
Copy `backend/task_management/.env.example` and adjust values:
```
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL configuration
DB_ENGINE=django.db.backends.postgresql
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

ACCESS_TOKEN_LIFETIME=60          # minutes
REFRESH_TOKEN_LIFETIME=1440       # minutes
```

Requires the `psycopg2-binary` driver (already listed in `requirements.txt`). Update the DB_* values to match your server, run `python manage.py migrate`, and the project will use PostgreSQL instead of SQLite automatically. 

### Frontend (`frontend/.env`)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000   # optional override; defaults derived from API URL
```

## Key API Endpoints

| Area | Method & Path | Notes |
|------|---------------|-------|
| Auth | `POST /api/auth/register/` | Returns user + tokens |
|      | `POST /api/auth/login/` | JWT login |
|      | `POST /api/auth/logout/` | Optional refresh blacklist |
|      | `POST /api/auth/token/refresh/` | Refresh access |
|      | `GET/PATCH /api/auth/profile/` | Manage current user |
| Tasks | `GET/POST /api/tasks/` | Owner-scoped list/create with filtering, search, ordering, pagination |
|       | `GET/PUT/PATCH/DELETE /api/tasks/{id}/` | CRUD (owner only) |
|       | `GET /api/tasks/summary/` | Total/completed/pending/high priority |
|       | `POST /api/tasks/reorder/` | Accepts `{"task_ids": [..]}` for drag/drop ordering |
|       | `GET /api/tasks/admin/overview/` | Staff analytics with priority/status breakdown, top users, recent tasks |
| Logs  | `GET /api/logs/` | Paginated audit trail (auth required) |
| Realtime | `WS /ws/tasks/?token=<access>` | Streams `task_created/updated/deleted`, `task_summary`, `tasks_reordered` events |

Responses are JSON-only (DRF renderer limited to `JSONRenderer`) and leverage consistent success/error messaging.

## UI Pages
- **Register / Login:** Form validation, toast feedback, secure token storage
- **Dashboard:** Filters, search, pagination, drag/drop ordering, inline status toggles, live stats badge
- **Create / Edit Task:** Reusable form component with validation
- **Analytics:** Charts for status & priority plus summary metrics
- **Activity Log:** Paginated audit entries with color-coded actions and diffs
- **Admin Control Panel:** Staff-only overview, top contributors, recent tasks timeline

## Audit Logging
- Signals capture task create/update/delete, plus explicit `Status Changed` & `Priority Changed`
- Data stored in `AuditLog` model and exposed via `/api/logs/`
- Frontend renders structured change data with icons, badges, and timestamps

## Testing & Verification
- `python manage.py test` (backend)
- `npm test` (frontend CRA scripts)
- Linting and formatting handled by project defaults (DRF conventions + Tailwind)

## Real-Time Behavior
- Every task mutation triggers signal-driven broadcasts + audit logs
- Frontend WebSocket listener updates stats and refreshes the current page automatically
- Drag & drop reorder triggers persisted ordering and syncs across clients

You're ready to run the stack locally with `npm start` + `python manage.py runserver`, explore Swagger docs at `/swagger/`, and manage tasks with live updates.

