[README.md](https://github.com/user-attachments/files/26299038/README.md)
# 🌐 Arqive Monorepo

A full-stack web application built with:

- 🐍 **Django** (Python) — Backend API  
- 🐘 **PostgreSQL** — Database  
- 🐳 **Docker Compose** — Container orchestration  
- ⚛️ **React** — Frontend client

This repository is organized as a **monorepo** — both the frontend and backend live in the same project directory for easier development and deployment.

---

## 📁 Project Structure

```
.
├── backend/              # Django backend code
│   ├── GlobalTraqs/      # Django project & apps
│   └── requirements.txt  # Python dependencies
│
├── docker/               # Docker-related configuration
│   ├── django/           # Django container config & env files
│   └── postgres/         # Postgres container config
│
├── frontend/             # React frontend client
│   ├── public/           # Static files
│   ├── src/              # Frontend source code
│   └── package.json      # JS dependencies
│
├── docker-compose.yml    # Compose services for backend, frontend, db
└── README.md             # You're reading this!
```

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/arqive.git
```

---

### 2. Configure Environment Variables and Database Dump

**Environment Variables**

This project uses `.env` files for secrets and configuration.  
These files are **NOT committed to Git** for security reasons.

Sample development environment files are included:

- `frontend/.env.development`
- `docker/django/.env.development`

Before running the project, **copy them to `.env`**:

```bash
cd arqive
cp frontend/.env.development frontend/.env
cp docker/django/.env.development docker/django/.env
```
**Databse Dump**

A database dump must be placed at: 
- `docker/postgres/defaultdb.sql`

This is not included in the repo as it is a security risk. It can be obtained from the team lead.

---

### 3. Start Backend (Django + Postgres)

Build and load the database:

```bash
docker compose up db
```

This builds the container and loads the defaultdb.sql file.  Anytime you run 'docker compose down -v --remove-orphans' you'll need to run this or the first time run 'docker compose up' the database will have to build and will not be ready before the Django service.


Run the backend with Docker Compose:

```bash
docker compose up --build
```

This will:

- Build the backend Django container
- Start the PostgreSQL database
- Expose the backend API on `http://localhost:8000`

Once running, you can access the Django admin panel (if configured) at:

- http://localhost:8000/admin/

---

### 4. Start Frontend (React)

In a separate terminal:

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

This will run the React development server on:

- http://localhost:3000

The frontend will automatically proxy API requests to the backend.

---

#### 📌 Adding New Environment Variables

If you add new variables:

- Always add them with **stub or placeholder values** to the `.env.development` file.
- Never commit real API keys, secrets, or passwords.

Example (`frontend/src/.env.development`):

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_MAPBOX_TOKEN=your-mapbox-token-here
```

Example (`docker/django/.env.development`):

```env
DJANGO_SECRET_KEY=replace-me
DJANGO_DEBUG=True
DATABASE_URL=postgres://doadmin:postgres@postgres:5432/postgres
```

---

## 🐍 Backend Management Commands

Run Django management commands inside the container:

```bash
docker compose exec django python GlobalTraqs/manage.py migrate
docker compose exec django python GlobalTraqs/manage.py makemigrations
docker compose exec django python GlobalTraqs/manage.py createsuperuser
docker compose exec django python GlobalTraqs/manage.py collectstatic
```

---

## 🧪 Development Tips

- When you change Python dependencies, rebuild the backend container:

```bash
docker compose up --build
```

- When you change environment variables, restart the containers:

```bash
docker compose down
docker compose up -d
```

- Frontend hot reloads automatically when you save changes in `src/`.

---

## 🗂️ Project Conventions

### Environment Files

- **Do not commit `.env` files** — they are ignored by `.gitignore`.
- **Do commit `.env.development`** — they show which variables are required.

### Git Commits

- Use clear commit messages: `feat: add user profile API`, `fix: correct env var name`
- Avoid committing build artifacts or environment-specific files.

---

## 🛠️ Troubleshooting

**❌ Database connection error:**  
Try rebuilding the `db` container `docker compose up db`

**❌ Docker won't start:**  
Run a clean rebuild:

```bash
docker compose down -v
docker compose up --build
```

