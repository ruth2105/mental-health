# System Architecture

## Overview

The Mental Health Platform follows a modern client-server architecture with real-time capabilities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Patient Portal    - Therapist Portal    - Admin      │
│  - Real-time UI      - WebRTC Video        - WebSocket  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS / WSS
                     │
┌────────────────────▼────────────────────────────────────┐
│              Backend (Django + Channels)                 │
│  - REST API          - WebSocket Consumers              │
│  - Authentication    - Business Logic                   │
│  - AI Model          - Signal Handlers                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ ORM / Redis
                     │
┌────────────────────▼────────────────────────────────────┐
│              Data Layer                                  │
│  - PostgreSQL (Primary)    - Redis (Cache/Sessions)     │
│  - S3 (File Storage)       - Backups                    │
└─────────────────────────────────────────────────────────┘
```

## Components

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Context + Custom Hooks
- **Routing**: React Router v6

### Backend
- **Framework**: Django 4.x
- **API**: Django REST Framework
- **Auth**: Simple JWT
- **Real-time**: Django Channels
- **Task Queue**: Celery (optional)

### Database
- **Primary**: PostgreSQL
- **Cache**: Redis
- **Search**: PostgreSQL Full-Text (or Elasticsearch)

### External Services
- **Payment**: Chapa Gateway
- **Video**: Agora/Twilio
- **Email**: SMTP/SendGrid
- **Storage**: AWS S3 or local

## Data Flow

### User Authentication
1. User submits credentials
2. Backend validates and generates JWT
3. Frontend stores token
4. Token included in subsequent requests

### Appointment Booking
1. Patient selects therapist and time
2. Frontend sends booking request
3. Backend validates and creates appointment
4. Payment initiated
5. On payment success, appointment confirmed
6. Notifications sent to both parties

### Video Session
1. User requests video token
2. Backend generates Agora/Twilio token
3. Frontend initializes WebRTC
4. Peer-to-peer connection established
5. Session data logged

## Security

- JWT authentication
- HTTPS/WSS encryption
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens

## Scalability

- Horizontal scaling with load balancer
- Database connection pooling
- Redis caching
- CDN for static files
- Async task processing
- Database read replicas

## Monitoring

- Application logs
- Error tracking (Sentry)
- Performance monitoring
- Database query analysis
- API response times
