# Production Deployment Guide

Complete guide for deploying the Mental Health Platform to production.

## Prerequisites

- Domain name
- SSL certificate
- PostgreSQL database
- Redis (for caching and WebSocket)
- Cloud hosting account (AWS, DigitalOcean, Heroku, etc.)

## Environment Configuration

### Backend (.env)

```env
# Django
SECRET_KEY=your-production-secret-key-change-this
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Payment
CHAPA_SECRET_KEY=your-production-chapa-key
CHAPA_WEBHOOK_SECRET=your-webhook-secret

# Video
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate

# Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
```

### Frontend (.env)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
VITE_CHAPA_PUBLIC_KEY=your-public-key
```

## Deployment Options

### Option 1: Docker Deployment

1. **Build Images**

```bash
# Build backend
docker build -t mental-health-backend ./backend

# Build frontend
docker build -t mental-health-frontend ./frontend
```

2. **Run with Docker Compose**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Traditional Server (Ubuntu)

#### Backend Deployment

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3-pip python3-venv postgresql nginx redis-server

# Clone repository
git clone <your-repo>
cd mental-health-app/backend

# Setup virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
python manage.py migrate
python manage.py collectstatic --noinput

# Create superuser
python manage.py createsuperuser

# Setup Gunicorn
pip install gunicorn
gunicorn mental_health_project.wsgi:application --bind 0.0.0.0:8000
```

#### Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with nginx
sudo cp -r dist/* /var/www/html/
```

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/mental-health

# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/mental-health /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

#### Systemd Service

Create `/etc/systemd/system/mental-health.service`:

```ini
[Unit]
Description=Mental Health Platform
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/mental-health-app/backend
Environment="PATH=/path/to/.venv/bin"
ExecStart=/path/to/.venv/bin/gunicorn mental_health_project.wsgi:application --bind 0.0.0.0:8000 --workers 4

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable mental-health
sudo systemctl start mental-health
sudo systemctl status mental-health
```

### Option 3: Platform as a Service

#### Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser
```

#### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Railway (Backend)

1. Connect GitHub repository
2. Select backend directory
3. Add environment variables
4. Deploy automatically

## Database Setup

### PostgreSQL

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE mental_health_db;
CREATE USER mental_health_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE mental_health_db TO mental_health_user;
\q

# Run migrations
python manage.py migrate
```

### Backup Strategy

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump mental_health_db > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

## Monitoring

### Application Monitoring

Install Sentry:

```bash
pip install sentry-sdk
```

Configure in `settings.py`:

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

### Server Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/mental-health
```

## Security Checklist

- [ ] Change SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall (ufw)
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup backup strategy
- [ ] Configure monitoring
- [ ] Review security headers
- [ ] Enable CSRF protection
- [ ] Secure database credentials
- [ ] Setup fail2ban

## Performance Optimization

### Backend

```python
# settings.py

# Caching
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# Database connection pooling
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 600,
    }
}
```

### Frontend

```bash
# Build optimizations
npm run build

# Analyze bundle
npm run build -- --analyze
```

## Scaling

### Horizontal Scaling

- Use load balancer (Nginx, HAProxy)
- Multiple application servers
- Shared database and Redis
- CDN for static files

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Enable caching
- Use connection pooling

## Maintenance

### Updates

```bash
# Backend
git pull
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart mental-health

# Frontend
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

### Health Checks

```bash
# API health
curl https://api.yourdomain.com/api/health/

# Database
python manage.py check --database default

# Redis
redis-cli ping
```

## Troubleshooting

### Common Issues

**502 Bad Gateway**
- Check if backend is running
- Verify Nginx configuration
- Check firewall rules

**Database Connection Error**
- Verify DATABASE_URL
- Check PostgreSQL is running
- Verify credentials

**Static Files Not Loading**
- Run collectstatic
- Check STATIC_ROOT
- Verify Nginx configuration

See [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md) for more help.

## Support

- Documentation: [docs/](../)
- Issues: GitHub Issues
- Email: support@example.com
