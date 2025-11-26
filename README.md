# 📋 Task Management Platform

<div align="center">

A modern, full-stack task and workflow management platform built with Django REST Framework and React. Features secure JWT authentication, real-time collaboration via WebSockets, comprehensive analytics, and an intuitive UI with dark mode support.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## ✨ Features

### 🔐 Authentication & Security

- JWT-based authentication with refresh token rotation
- User registration, login, and profile management
- Role-based access control (RBAC)
- Secure API endpoints with permission guards

### 📝 Task Management

- Full CRUD operations for tasks
- Advanced filtering and search capabilities
- Custom priority ordering (High → Medium → Low)
- Drag-and-drop task reordering
- Status toggles (Pending/Completed)
- Pagination support
- Real-time task updates via WebSockets

### 📊 Analytics & Insights

- Task summary statistics
- Priority and status breakdowns
- Admin dashboard with user insights
- Interactive charts and visualizations

### 📜 Audit & Activity Logging

- Comprehensive audit trail for all task operations
- Activity log with detailed change tracking
- Paginated activity history
- Color-coded action indicators

### 🎨 User Experience

- Modern, responsive UI with Tailwind CSS
- Dark mode support
- Toast notifications
- Loading states and skeletons
- Form validation
- Keyboard accessibility
- Real-time collaboration indicators

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   React Client  │ ◄─────► │  Django REST API │
│   (Port 3000)   │  HTTP   │   (Port 8000)    │
└─────────────────┘         └──────────────────┘
         │                           │
         │                           │
         └──────────► WebSocket ─────┘
              (Real-time Updates)
```

### Technology Stack

| Layer          | Technologies                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------- |
| **Backend**    | Django 5, Django REST Framework, SimpleJWT, Django Channels, django-filter, drf-yasg          |
| **Frontend**   | React 18, React Router 6, Tailwind CSS, react-beautiful-dnd, react-chartjs-2, react-hot-toast |
| **Database**   | PostgreSQL (production) / SQLite (development)                                                |
| **Real-time**  | Django Channels with WebSocket support                                                        |
| **Deployment** | Render (backend) / Vercel (frontend)                                                          |

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.11 or higher
- **Node.js** 18 or higher and npm
- **PostgreSQL** (optional; SQLite works for development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd TASK
   ```

2. **Set up the backend**

   ```bash
   cd backend/task_management
   python -m venv .venv

   # Windows
   .venv\Scripts\activate

   # macOS/Linux
   source .venv/bin/activate

   pip install -r ../requirements.txt
   ```


3. **Run database migrations**

   ```bash
   python manage.py migrate
   ```

5. **Set up the frontend**

   ```bash
   cd ../../frontend
   npm install
   ```


### Running the Application

1. **Start the backend server**

   ```bash
   cd backend/task_management
   python manage.py runserver
   ```

   Backend will be available at `http://localhost:8000`

2. **Start the frontend server** (in a new terminal)

   ```bash
   cd frontend
   npm start
   ```

   Frontend will be available at `http://localhost:3000`

3. **Access the application**

   - Open `http://localhost:3000` in your browser
   - Register a new account or log in
   - Start managing your tasks!

---

## 📁 Project Structure

```
.
├── backend/
│   ├── task_management/
│   │   ├── apps/
│   │   │   ├── authentication/    # User authentication
│   │   │   ├── tasks/             # Task models, views, serializers
│   │   │   └── audit/             # Audit logging
│   │   ├── task_management/       # Django settings, URLs, ASGI
│   │   ├── manage.py
│   │   └── requirements.txt
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/                   # API client functions
│   │   ├── components/            # Reusable UI components
│   │   │   ├── auth/              # Authentication components
│   │   │   ├── tasks/             # Task-related components
│   │   │   ├── layout/            # Layout components
│   │   │   └── common/            # Common UI components
│   │   ├── pages/                 # Page components
│   │   ├── context/               # React Context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── routes/                # Route definitions
│   │   └── utils/                 # Utility functions
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## 🔌 API Documentation

### Authentication Endpoints

| Method  | Endpoint                   | Description                      |
| ------- | -------------------------- | -------------------------------- |
| `POST`  | `/api/auth/register/`      | Register a new user              |
| `POST`  | `/api/auth/login/`         | Login and get JWT tokens         |
| `POST`  | `/api/auth/logout/`        | Logout (blacklist refresh token) |
| `POST`  | `/api/auth/token/refresh/` | Refresh access token             |
| `GET`   | `/api/auth/profile/`       | Get current user profile         |
| `PATCH` | `/api/auth/profile/`       | Update user profile              |

### Task Endpoints

| Method   | Endpoint                     | Description                                    |
| -------- | ---------------------------- | ---------------------------------------------- |
| `GET`    | `/api/tasks/`                | List tasks (filterable, searchable, paginated) |
| `POST`   | `/api/tasks/`                | Create a new task                              |
| `GET`    | `/api/tasks/{id}/`           | Get task details                               |
| `PUT`    | `/api/tasks/{id}/`           | Update task (full)                             |
| `PATCH`  | `/api/tasks/{id}/`           | Update task (partial)                          |
| `DELETE` | `/api/tasks/{id}/`           | Delete a task                                  |
| `POST`   | `/api/tasks/reorder/`        | Reorder tasks (drag & drop)                    |
| `GET`    | `/api/tasks/summary/`        | Get task summary statistics                    |
| `GET`    | `/api/tasks/admin/overview/` | Admin dashboard overview (staff only)          |

### Audit Log Endpoints

| Method | Endpoint          | Description                  |
| ------ | ----------------- | ---------------------------- |
| `GET`  | `/api/logs/`      | Get paginated audit logs     |
| `GET`  | `/api/logs/{id}/` | Get specific audit log entry |

### WebSocket Endpoint

| Protocol | Endpoint                          | Description            |
| -------- | --------------------------------- | ---------------------- |
| `WS`     | `/ws/tasks/?token={access_token}` | Real-time task updates |




## 🎯 Key Features Explained

### Priority Ordering

Tasks can be sorted by priority with custom ordering logic:

- **High** priority tasks appear first
- **Medium** priority tasks appear second
- **Low** priority tasks appear last

The backend uses Django's `Case/When` to assign priority weights for proper sorting.

### Real-Time Updates

The application uses Django Channels WebSocket to provide real-time updates:

- Task creation, updates, and deletions are broadcast instantly
- Task summary statistics update automatically
- Multiple users can collaborate in real-time

### Audit Logging

Every task operation is automatically logged:

- Task creation, updates, and deletions
- Status and priority changes
- User actions with timestamps
- Detailed change tracking

---

## 🧪 Testing

### Backend Tests

```bash
cd backend/task_management
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🚢 Deployment

### Backend Deployment (Render)

1. **Service Configuration**

   - Service Type: `Web Service`
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend/task_management && gunicorn task_management.wsgi:application --bind 0.0.0.0:$PORT`

2. **Environment Variables**

   ```env
   SECRET_KEY=<strong-random-string>
   DEBUG=False
   DATABASE_URL=<postgresql-url>
   ACCESS_TOKEN_LIFETIME=60
   REFRESH_TOKEN_LIFETIME=1440
   ALLOWED_HOSTS=<your-domain>
   ```

3. **Database Setup**
   - Create a PostgreSQL database on Render
   - Set `DATABASE_URL` environment variable

### Frontend Deployment (Vercel)

1. **Project Configuration**

   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `frontend/build`

2. **Environment Variables**

   ```env
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_WS_URL=wss://your-backend-url.onrender.com
   ```

3. **Deploy**
   - Connect your repository to Vercel
   - Set environment variables
   - Deploy automatically on push

---

## 🛠️ Development

### Running in Development Mode

1. **Backend** (with auto-reload)

   ```bash
   cd backend/task_management
   python manage.py runserver
   ```

2. **Frontend** (with hot-reload)
   ```bash
   cd frontend
   npm start
   ```

### Code Style

- **Backend**: Follows PEP 8 and Django coding standards
- **Frontend**: Uses ESLint and Prettier for code formatting

### Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

---

## 📝 Environment Variables Reference

### Backend (.env)

| Variable                 | Description                          | Default               |
| ------------------------ | ------------------------------------ | --------------------- |
| `SECRET_KEY`             | Django secret key                    | Required              |
| `DEBUG`                  | Debug mode                           | `True`                |
| `ALLOWED_HOSTS`          | Allowed hostnames                    | `localhost,127.0.0.1` |
| `DATABASE_URL`           | Database connection URL              | SQLite (dev)          |
| `ACCESS_TOKEN_LIFETIME`  | JWT access token lifetime (minutes)  | `60`                  |
| `REFRESH_TOKEN_LIFETIME` | JWT refresh token lifetime (minutes) | `1440`                |

### Frontend (.env)

| Variable            | Description     | Default                     |
| ------------------- | --------------- | --------------------------- |
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `REACT_APP_WS_URL`  | WebSocket URL   | `ws://localhost:8000`       |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

---


---

## 🙏 Acknowledgments

- Django REST Framework for the robust API framework
- React team for the amazing frontend library
- Tailwind CSS for the utility-first CSS framework
- All contributors and users of this project

---

<div align="center">

**Built with ❤️ using Django and React**

[Report Bug](https://github.com/your-repo/issues) · [Request Feature](https://github.com/your-repo/issues) · [Documentation](https://github.com/your-repo/wiki)

</div>
