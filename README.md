# 🏥 Mental Health Platform

A comprehensive mental health therapy platform with AI-powered assessments, video sessions, and secure payment processing.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd mental-health-app

# Backend setup
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser

# Frontend setup
cd ../frontend
npm install

# Run development servers
# Terminal 1 - Backend
cd backend
.venv\Scripts\python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit: http://localhost:5173

## 📚 Documentation

- **Setup Guide**: [docs/setup/SETUP.md](docs/setup/SETUP.md)
- **API Documentation**: [docs/api/API.md](docs/api/API.md)
- **User Guides**: [docs/user-guides/](docs/user-guides/)
- **Deployment**: [docs/deployment/DEPLOYMENT.md](docs/deployment/DEPLOYMENT.md)
- **Troubleshooting**: [docs/troubleshooting/TROUBLESHOOTING.md](docs/troubleshooting/TROUBLESHOOTING.md)

## ✨ Features

### For Patients
- 🤖 AI-powered mental health assessment
- 👨‍⚕️ Browse and book therapists
- 💳 Secure payment processing
- 📹 Live video therapy sessions
- ⭐ Rate and review therapists

### For Therapists
- 📋 Manage appointments and patients
- 📹 Conduct video sessions
- 📝 Session notes and progress tracking
- 💰 Earnings tracking

### For Admins
- 👥 User management
- ✅ Therapist verification
- 📊 Analytics dashboard
- 🔒 Audit logs

## 🛠️ Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui  
**Backend**: Django 4.x, Django REST Framework, JWT Auth  
**Database**: PostgreSQL (production) / SQLite (development)  
**AI/ML**: CatBoost for mental health predictions  
**Real-time**: WebRTC (video), WebSocket (chat, notifications)  
**Payments**: Chapa Gateway

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🐳 Docker Setup

```bash
docker-compose up -d
```

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Backend
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:pass@localhost/dbname
CHAPA_SECRET_KEY=your-chapa-key

# Frontend
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Email: support@example.com

---

**Status**: Production Ready ✅  
**Version**: 1.0.0  
**Last Updated**: December 2024
