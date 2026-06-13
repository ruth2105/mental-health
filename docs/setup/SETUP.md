# Setup Guide

Complete installation and configuration guide for the Mental Health Platform.

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+ (production) or SQLite (development)
- Git

## Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd mental-health-app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Configure .env file
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create test data (optional)
python scripts/create_test_data.py

# Run development server
python manage.py runserver
```

Backend will be available at: http://localhost:8000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Configure .env file
# Edit .env with your settings

# Run development server
npm run dev
```

Frontend will be available at: http://localhost:5173

## Test Accounts

After running test data script:

**Patient**:
- Email: patient@test.com
- Password: password123

**Therapist**:
- Email: therapist@test.com
- Password: password123

**Admin**:
- Email: admin@test.com
- Password: admin123

## Verify Installation

1. Visit http://localhost:5173
2. Login with test account
3. Navigate through the dashboard
4. Check API at http://localhost:8000/api

## Next Steps

- [User Guides](../user-guides/)
- [API Documentation](../api/API.md)
- [Troubleshooting](../troubleshooting/TROUBLESHOOTING.md)

## Common Issues

### Backend won't start
- Check Python version: `python --version`
- Verify virtual environment is activated
- Check database connection in .env

### Frontend won't start
- Check Node version: `node --version`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check API URL in .env

### Database errors
- Run migrations: `python manage.py migrate`
- Reset database: `python manage.py flush`
- Check PostgreSQL is running

See [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md) for more help.
