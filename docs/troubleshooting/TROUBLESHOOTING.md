# Troubleshooting Guide

Common issues and solutions for the Mental Health Platform.

## Backend Issues

### Database Connection Error

**Problem**: `django.db.utils.OperationalError: could not connect to server`

**Solutions**:
1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. For development, use SQLite: `DATABASE_URL=sqlite:///db.sqlite3`

### Migration Errors

**Problem**: `django.db.migrations.exceptions.InconsistentMigrationHistory`

**Solutions**:
```bash
# Reset migrations (development only!)
python manage.py migrate --fake
python manage.py migrate

# Or reset database
python manage.py flush
python manage.py migrate
```

### Import Errors

**Problem**: `ModuleNotFoundError: No module named 'rest_framework'`

**Solutions**:
```bash
# Ensure virtual environment is activated
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Reinstall dependencies
pip install -r requirements.txt
```

### Port Already in Use

**Problem**: `Error: That port is already in use`

**Solutions**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Or use different port
python manage.py runserver 8001
```

## Frontend Issues

### npm install Fails

**Problem**: `npm ERR! code ERESOLVE`

**Solutions**:
```bash
# Clear cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# Use legacy peer deps
npm install --legacy-peer-deps
```

### Build Errors

**Problem**: `Module not found` or `Cannot find module`

**Solutions**:
```bash
# Reinstall dependencies
npm ci

# Check imports are correct
# Verify file paths match case-sensitive names
```

### API Connection Failed

**Problem**: `Network Error` or `CORS error`

**Solutions**:
1. Check backend is running: http://localhost:8000
2. Verify VITE_API_URL in frontend/.env
3. Check CORS_ALLOWED_ORIGINS in backend/.env

### Hot Reload Not Working

**Problem**: Changes not reflecting in browser

**Solutions**:
```bash
# Restart dev server
Ctrl+C
npm run dev

# Clear browser cache
# Hard refresh: Ctrl+Shift+R
```

## Docker Issues

### Container Won't Start

**Problem**: `Error response from daemon`

**Solutions**:
```bash
# Check logs
docker-compose logs backend

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Remove volumes
docker-compose down -v
docker-compose up -d
```

### Database Connection in Docker

**Problem**: Backend can't connect to database

**Solutions**:
1. Check docker-compose.yml database config
2. Ensure DATABASE_URL uses service name: `postgresql://user:pass@db:5432/dbname`
3. Wait for database to be ready (add healthcheck)

## Authentication Issues

### JWT Token Expired

**Problem**: `401 Unauthorized` after some time

**Solutions**:
- Refresh token using `/api/users/token/refresh/`
- Re-login to get new tokens
- Check token expiry settings in backend

### Login Fails

**Problem**: Correct credentials but login fails

**Solutions**:
1. Check user exists: `python manage.py shell`
2. Verify password: `User.objects.get(email='...').check_password('...')`
3. Check backend logs for errors

## Payment Issues

### Chapa Integration Fails

**Problem**: Payment initialization fails

**Solutions**:
1. Verify CHAPA_SECRET_KEY in .env
2. Check Chapa API status
3. Review backend logs for API errors
4. Test with Chapa test credentials

## Video Session Issues

### Video Not Loading

**Problem**: Video session won't start

**Solutions**:
1. Check AGORA_APP_ID is configured
2. Verify token generation endpoint works
3. Check browser permissions for camera/mic
4. Test in different browser

### WebSocket Connection Failed

**Problem**: Real-time features not working

**Solutions**:
1. Check Redis is running
2. Verify WebSocket URL in frontend
3. Check firewall/proxy settings
4. Review browser console for errors

## Performance Issues

### Slow API Responses

**Solutions**:
1. Enable database query logging
2. Add database indexes
3. Implement caching with Redis
4. Optimize serializers

### High Memory Usage

**Solutions**:
1. Check for memory leaks
2. Limit query result sizes
3. Use pagination
4. Optimize image sizes

## Testing Issues

### Tests Failing

**Problem**: `pytest` tests fail

**Solutions**:
```bash
# Install test dependencies
pip install pytest pytest-django pytest-cov

# Check test database
# Ensure TEST_DATABASE is configured

# Run specific test
pytest tests/test_auth.py -v

# Clear test database
python manage.py flush --database=test
```

## Deployment Issues

### Static Files Not Loading

**Problem**: CSS/JS not loading in production

**Solutions**:
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check STATIC_ROOT and STATIC_URL
# Verify nginx configuration
```

### Environment Variables Not Working

**Problem**: Settings not applied

**Solutions**:
1. Check .env file exists
2. Verify python-decouple is installed
3. Restart application after changes
4. Check variable names match exactly

## Getting More Help

### Check Logs

**Backend**:
```bash
# Development
python manage.py runserver  # Shows in terminal

# Production
tail -f /var/log/mental-health/error.log
```

**Frontend**:
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### Debug Mode

**Backend**:
```python
# settings.py
DEBUG = True  # Only in development!
```

**Frontend**:
```bash
# Check build output
npm run build -- --debug
```

### Community Support

- GitHub Issues: Report bugs
- Documentation: [docs/](../)
- Stack Overflow: Tag with project name

### Contact

- Email: support@example.com
- Discord: [Join Server]
- Forum: [Community Forum]

---

**Still stuck?** Open an issue with:
- Error message
- Steps to reproduce
- Environment details (OS, Python/Node version)
- Relevant logs
