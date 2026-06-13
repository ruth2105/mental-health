# 🧠 Mental Health Therapy Platform

A comprehensive mental health therapy platform built with Django REST Framework and React, featuring video consultations, appointment booking, real-time chat, and AI-powered mental health assessments.

## ✨ Features

### For Patients
- 🔐 Secure user authentication and registration
- 👨‍⚕️ Browse and search therapists by specialization
- 📅 Book and manage therapy appointments
- 💳 Integrated payment system
- 📹 Real-time video consultations with WebRTC
- 💬 In-session chat messaging
- 🧠 AI-powered mental health assessment
- 📊 View appointment history and feedback
- 🔔 Real-time notifications

### For Therapists
- 👥 Manage patient appointments
- 📝 Session notes and documentation
- 💬 Real-time chat with patients
- 📹 Video consultation platform
- 📊 Patient management dashboard
- ⭐ Receive and view patient feedback
- 🔔 Appointment notifications

### For Administrators
- 👨‍💼 Therapist approval system
- 📊 User management dashboard
- 📈 Appointment oversight
- 🔧 System configuration

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2 + Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Real-time**: Django Channels + WebSockets
- **Authentication**: JWT tokens
- **AI/ML**: CatBoost for mental health assessment
- **Video**: WebRTC signaling server

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Video**: Simple-peer (WebRTC)

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create test users
python create_test_user.py

# Start development server
python manage.py runserver
```

Backend will run on `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👤 Test Accounts

After running `create_test_user.py`:

**Patient Account:**
- Email: `patient@test.com`
- Password: `password123`

**Therapist Account:**
- Email: `therapist@test.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@test.com`
- Password: `admin123`

## 📁 Project Structure

```
mental-health-app/
├── backend/
│   ├── appointments/      # Appointment management
│   ├── chat/             # Real-time chat system
│   ├── notifications/    # Notification system
│   ├── payments/         # Payment processing
│   ├── users/            # User authentication & profiles
│   ├── video/            # Video consultation
│   ├── backend/          # Django settings
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # Context providers
│   │   └── routes/       # Route configuration
│   ├── public/
│   └── package.json
└── README.md
```

## 🔑 Key Features Explained

### Video Consultations
- WebRTC-based peer-to-peer video calls
- Real-time signaling via WebSockets
- In-call chat messaging
- Session recording capabilities

### AI Mental Health Assessment
- CatBoost machine learning model
- Predicts mental health conditions
- Based on patient responses
- Provides severity scores

### Real-time Notifications
- WebSocket-based notifications
- HTTP polling fallback
- Appointment reminders
- Session join alerts
- Message notifications

### Appointment System
- Calendar-based booking
- Status tracking (Scheduled, Completed, Cancelled)
- Payment integration
- Automatic therapist notifications

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (Patient, Therapist, Admin)
- Therapist approval system
- Secure password hashing
- CORS configuration
- Environment variable protection

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-optimized UI
- Mobile-friendly video calls
- Progressive Web App ready

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm run test
```

## 📦 Deployment

See `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

### Quick Deploy Options
- **Frontend**: Vercel, Netlify
- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: PostgreSQL on Heroku, AWS RDS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Django REST Framework team
- React team
- shadcn/ui for beautiful components
- WebRTC community

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

Made with ❤️ for mental health awareness
