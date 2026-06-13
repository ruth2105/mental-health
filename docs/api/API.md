# API Documentation

Complete REST API reference for the Mental Health Platform.

## Base URL

- Development: `http://localhost:8000/api`
- Production: `https://your-domain.com/api`

## Authentication

All authenticated endpoints require JWT token in header:

```
Authorization: Bearer <your-jwt-token>
```

### Get Token

```http
POST /api/users/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "patient"
  }
}
```

## Endpoints

### Authentication

#### Register
```http
POST /api/users/register/
```

#### Login
```http
POST /api/users/login/
```

#### Refresh Token
```http
POST /api/users/token/refresh/
```

### Users

#### Get Profile
```http
GET /api/users/profile/
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /api/users/profile/
Authorization: Bearer <token>
```

#### List Therapists
```http
GET /api/users/therapists/
```

### Appointments

#### List Appointments
```http
GET /api/appointments/
Authorization: Bearer <token>
```

#### Create Appointment
```http
POST /api/appointments/create/
Authorization: Bearer <token>

{
  "therapist_id": 1,
  "date": "2024-12-15",
  "time": "14:00"
}
```

#### Get Appointment Details
```http
GET /api/appointments/{id}/
Authorization: Bearer <token>
```

#### Submit Feedback
```http
POST /api/appointments/{id}/feedback/
Authorization: Bearer <token>

{
  "rating": 5,
  "comment": "Great session!"
}
```

### Payments

#### Initiate Payment
```http
POST /api/payments/initiate/
Authorization: Bearer <token>

{
  "appointment_id": 1,
  "amount": 500
}
```

#### Verify Payment
```http
POST /api/payments/verify/
Authorization: Bearer <token>

{
  "transaction_ref": "CHAPA-TX-123"
}
```

#### Payment History
```http
GET /api/payments/history/
Authorization: Bearer <token>
```

### Mental Health Assessment

#### Submit Assessment
```http
POST /api/mental_health/predict/
Authorization: Bearer <token>

{
  "phq9_score": 15,
  "gad7_score": 12,
  "age": 25,
  "gender": "female"
}
```

#### Assessment History
```http
GET /api/mental_health/history/
Authorization: Bearer <token>
```

### Video Sessions

#### Get Video Token
```http
GET /api/video/token/?appointment_id=1
Authorization: Bearer <token>
```

#### End Session
```http
POST /api/video/end-session/
Authorization: Bearer <token>

{
  "appointment_id": 1
}
```

### Admin (Admin Only)

#### System Stats
```http
GET /api/users/admin/stats/
Authorization: Bearer <admin-token>
```

#### List Users
```http
GET /api/users/admin/users/
Authorization: Bearer <admin-token>
```

#### Verify Therapist
```http
POST /api/users/admin/users/{id}/verify/
Authorization: Bearer <admin-token>
```

#### Toggle User Status
```http
POST /api/users/admin/users/{id}/toggle/
Authorization: Bearer <admin-token>
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid data",
  "details": {
    "email": ["This field is required"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- Admin: Unlimited

## Pagination

List endpoints support pagination:

```http
GET /api/appointments/?page=1&page_size=10
```

Response:
```json
{
  "count": 50,
  "next": "http://api/appointments/?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering & Search

```http
GET /api/users/therapists/?specialization=anxiety&min_price=100&max_price=500
```

## WebSocket Endpoints

### Notifications
```
ws://localhost:8000/ws/notifications/
```

### Chat
```
ws://localhost:8000/ws/chat/{room_id}/
```

### Video
```
ws://localhost:8000/ws/video/{session_id}/
```

## Testing

Use the provided Postman collection: `backend/postman_collection.json`

Or test with curl:

```bash
# Login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"password123"}'

# Get profile
curl -X GET http://localhost:8000/api/users/profile/ \
  -H "Authorization: Bearer <your-token>"
```

## SDK Examples

See [examples/](../examples/) for client SDK examples in:
- JavaScript/TypeScript
- Python
- Mobile (React Native)
