# API Services Documentation

This document describes all the API services available in the React frontend to connect with the Django backend.

## Configuration

The API base URL is configured in `src/services/api.js`. By default, it uses:
- `http://localhost:8000` (development)
- Or set `REACT_APP_API_URL` environment variable

Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:8000
```

## Available Services

### 1. Authentication Service (`authService`)

Handles user authentication and token management.

```javascript
import { authService } from './services';

// Register a new user
await authService.register({
  email: 'user@example.com',
  password: 'password123',
  // ... other user fields
});

// Login
await authService.login({
  email: 'user@example.com',
  password: 'password123',
});

// Logout (clears tokens)
authService.logout();

// Check if authenticated
const isAuth = authService.isAuthenticated();

// Get current token
const token = authService.getToken();

// Refresh token
await authService.refreshToken();
```

**Endpoints:**
- `POST /api/users/register/` - Register new user
- `POST /api/users/login/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token

---

### 2. User Service (`userService`)

Manages user profile operations.

```javascript
import { userService } from './services';

// Get current user profile
const profile = await userService.getProfile();
```

**Endpoints:**
- `GET /api/users/profile/` - Get current user profile (requires authentication)

---

### 3. Mental Health Service (`mentalHealthService`)

Handles AI predictions and therapist recommendations.

```javascript
import { mentalHealthService } from './services';

// Predict mental health disorder from symptoms
const prediction = await mentalHealthService.predict(['anxiety', 'stress', 'sleeplessness']);

// Get therapist recommendations
const recommendations = await mentalHealthService.getRecommendations();
```

**Endpoints:**
- `POST /api/mental_health/predict/` - Predict disorder from symptoms (requires authentication)
- `GET /api/mental_health/recommend/` - Get therapist recommendations (requires authentication)

---

### 4. Appointment Service (`appointmentService`)

Manages therapy sessions and video tokens.

```javascript
import { appointmentService } from './services';

// Start a therapy session
const session = await appointmentService.startSession(appointmentId);
// Returns: { room_id: "..." }

// Get video token for joining session
const videoData = await appointmentService.getVideoToken(appointmentId);
// Returns: { token: "...", room_name: "..." }
```

**Endpoints:**
- `POST /api/appointments/<appointment_id>/start-session/` - Start therapy session (requires authentication)
- `GET /api/appointments/<appointment_id>/token/` - Get video token (requires authentication)

---

### 5. Payment Service (`paymentService`)

Handles payment processing via Chapa.

```javascript
import { paymentService } from './services';

// Initiate a payment
const payment = await paymentService.initiatePayment({
  user: 1, // User ID
  amount: 1000,
  currency: 'ETB', // Optional, defaults to ETB
});
// Returns: { message, payment_reference, payment_link }

// Handle webhook (usually called by payment provider)
await paymentService.handleWebhook(webhookData);
```

**Endpoints:**
- `POST /api/payments/initiate/` - Initiate payment (requires authentication)
- `POST /api/payments/webhook/` - Handle payment webhook (no authentication)

---

### 6. Community Service (`communityService`)

Community-related endpoints.

```javascript
import { communityService } from './services';

// Check community service health
const health = await communityService.checkHealth();
```

**Endpoints:**
- `GET /api/community/health/` - Health check (no authentication required)

---

### 7. Notification Service (`notificationService`)

Notification-related endpoints.

```javascript
import { notificationService } from './services';

// Test notification service
const result = await notificationService.test();
```

**Endpoints:**
- `GET /api/notifications/test/` - Test endpoint (no authentication required)

---

### 8. Medical Records Service (`medicalRecordsService`)

Medical records endpoints.

```javascript
import { medicalRecordsService } from './services';

// Check medical records service health
const health = await medicalRecordsService.checkHealth();
```

**Endpoints:**
- `GET /api/medical_records/` - Health check (no authentication required)

---

## Using Authentication Context

The `AuthContext` provides React components with authentication state and methods.

```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout, register } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onSubmit={login} />;
  }

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**AuthContext provides:**
- `isAuthenticated` - Boolean indicating if user is logged in
- `user` - Current user object (if fetched)
- `loading` - Boolean indicating if auth check is in progress
- `login(credentials)` - Login function
- `register(userData)` - Register function
- `logout()` - Logout function
- `checkAuth()` - Manually check authentication

---

## Token Management

Tokens are automatically managed:
- **Access tokens** are stored in `localStorage` as `access_token`
- **Refresh tokens** are stored in `localStorage` as `refresh_token`
- Tokens are automatically added to all API requests via axios interceptors
- If a token expires (401 error), the interceptor automatically tries to refresh it
- If refresh fails, user is logged out and redirected to login

---

## Error Handling

All services throw errors that can be caught and handled:

```javascript
try {
  const result = await userService.getProfile();
  console.log(result);
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('Error data:', error.response.data);
    console.error('Status:', error.response.status);
  } else if (error.request) {
    // Request made but no response received
    console.error('No response from server');
  } else {
    // Error setting up request
    console.error('Error:', error.message);
  }
}
```

---

## Example: Complete Component

```javascript
import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { 
  userService, 
  mentalHealthService,
  appointmentService 
} from './services';

function Dashboard() {
  const { isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [predictions, setPredictions] = useState(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [profileData, recommendations] = await Promise.all([
        userService.getProfile(),
        mentalHealthService.getRecommendations(),
      ]);
      setProfile(profileData);
      setPredictions(recommendations);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={logout}>Logout</button>
      {/* Your component content */}
    </div>
  );
}
```

---

## Notes

- All authenticated endpoints require a valid JWT token in the Authorization header
- Tokens are automatically included in requests via axios interceptors
- The API base URL can be configured via environment variables
- CORS is enabled on the Django backend for all origins (configure for production)
