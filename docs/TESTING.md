# Testing Guide

Comprehensive testing documentation for the Mental Health Platform.

## Test Structure

```
backend/
├── tests/
│   ├── test_auth.py
│   ├── test_appointments.py
│   ├── test_payments.py
│   └── test_api.py

frontend/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
```

## Backend Testing

### Setup

```bash
cd backend
pip install pytest pytest-django pytest-cov
```

### Run Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=. --cov-report=html

# Specific test file
pytest tests/test_auth.py

# Specific test
pytest tests/test_auth.py::test_user_registration
```

### Writing Tests

```python
import pytest
from django.contrib.auth import get_user_model

@pytest.mark.django_db
def test_user_creation():
    User = get_user_model()
    user = User.objects.create_user(
        email='test@example.com',
        password='testpass123'
    )
    assert user.email == 'test@example.com'
```

## Frontend Testing

### Setup

```bash
cd frontend
npm install --save-dev vitest @testing-library/react
```

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## E2E Testing

```bash
npm run test:e2e
```

## Manual Testing

See [Manual Test Checklist](troubleshooting/MANUAL_TESTING.md)

## CI/CD

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment

See `.github/workflows/` for CI configuration.
