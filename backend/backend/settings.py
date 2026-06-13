import os
from pathlib import Path
from decouple import Config, RepositoryEnv
from datetime import timedelta

# =======================
# BASE DIRECTORY
# =======================
BASE_DIR = Path(__file__).resolve().parent.parent

# =======================
# LOAD ENVIRONMENT VARIABLES
# =======================
env_path = BASE_DIR / ".env"
config = Config(RepositoryEnv(env_path)) if env_path.exists() else None

# =======================
# SECURITY SETTINGS
# =======================
SECRET_KEY = config('SECRET_KEY', default='temporary_dev_secret_key')
DEBUG = config('DEBUG', default=True, cast=bool)

# Production security settings
if not DEBUG:
    ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    X_FRAME_OPTIONS = 'DENY'
else:
    ALLOWED_HOSTS = ['*']  # Development only

# Field-level encryption key
FIELD_ENCRYPTION_KEY = config('FIELD_ENCRYPTION_KEY', default=None)

# Security middleware settings
MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB
SECURITY_RATE_LIMIT_ENABLED = True

# =======================
# CUSTOM USER MODEL
# =======================
AUTH_USER_MODEL = 'users.User'

# =======================
# INSTALLED APPS
# =======================
INSTALLED_APPS = [
    # Django default apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',  # Django Channels for WebSocket support

    # Security apps
    'security',

    # Your apps
    'users',
    'mental_health_app',
    'appointments',
    'payments',
    'community',
    'notifications',
    'medical_records',
    # Video realtime conferencing app
    'video',
    # Chat system
    'chat',
    # Testimonials system
    'testimonials',
]

# =======================
# MIDDLEWARE
# =======================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # add near top, before CommonMiddleware
    'security.middleware.SecurityMiddleware',  # Custom security middleware
    'security.middleware.AuditLogMiddleware',  # Audit logging
    'security.middleware.DataProtectionMiddleware',  # GDPR/HIPAA compliance
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# =======================
# URL & TEMPLATES
# =======================
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],  # Optional templates directory
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = 'backend.asgi.application'

# =======================
# CHANNELS & REDIS CONFIGURATION
# =======================
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# =======================
# DATABASE
# =======================
# Using SQLite for development. Switch to MySQL/PostgreSQL in production
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# =======================
# PASSWORD VALIDATION
# =======================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# =======================
# INTERNATIONALIZATION
# =======================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Addis_Ababa'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# =======================
# STATIC & MEDIA FILES
# =======================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# =======================
# EMAIL SETTINGS
# =======================
# For development: Console backend (prints emails to console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# For production: Use SMTP (Gmail, SendGrid, AWS SES, etc.)
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
# EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
# EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = 'MindCare <noreply@mindcare.com>'
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173')

# =======================
# CORS SETTINGS
# =======================
CORS_ALLOW_ALL_ORIGINS = True  # Change in production

# Allow local frontend during development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Allow credentials for CORS
CORS_ALLOW_CREDENTIALS = True

# =======================
# REST FRAMEWORK SETTINGS
# =======================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# =======================
# SIMPLE JWT SETTINGS
# =======================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': 'mental-health-app',
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
}

# =======================
# CHAPA PAYMENT SETTINGS
# =======================
CHAPA_SECRET_KEY = config('CHAPA_SECRET_KEY', default='CHASECK_TEST-your-test-secret-key-here')
CHAPA_PUBLIC_KEY = config('CHAPA_PUBLIC_KEY', default='CHAPUBK_TEST-your-test-public-key-here')
CHAPA_DEMO_MODE = config('CHAPA_DEMO_MODE', default=True, cast=bool)
CHAPA_MERCHANT_ID = config('CHAPA_MERCHANT_ID', default='6469390')
CHAPA_CALLBACK_URL = config('CHAPA_CALLBACK_URL', default='http://localhost:8000/api/payments/webhook/')
CHAPA_RETURN_URL = config('CHAPA_RETURN_URL', default='http://localhost:5173/payment/success')

# =======================
# LOGGING CONFIGURATION
# =======================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'security': {
            'format': 'SECURITY {levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'security.log',
            'formatter': 'security',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'security': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['security_file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# Create logs directory if it doesn't exist
import os
os.makedirs(BASE_DIR / 'logs', exist_ok=True)

# =======================
# DEFAULT AUTO FIELD
# =======================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
