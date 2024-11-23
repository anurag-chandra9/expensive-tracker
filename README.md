# Expense Tracker

A full-stack web application for tracking personal expenses, built with React and Django.

## Features

- User authentication
- Add, edit, and delete expenses
- Categorize expenses
- View expense statistics
- Responsive design

## Tech Stack

### Backend
- Django
- Django REST Framework
- SQLite database

### Frontend
- React
- Material-UI
- React Router
- Axios

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create a superuser:
```bash
python manage.py createsuperuser
```

5. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin interface: http://localhost:8000/admin/
