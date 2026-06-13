"""
Advanced Security Validators
Input validation, sanitization, and security checks
"""
import re
import hashlib
import secrets
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator
from django.utils.html import strip_tags
import bleach
import logging

logger = logging.getLogger(__name__)

class SecurityValidator:
    """Comprehensive security validation utilities"""
    
    # Regex patterns for validation
    PATTERNS = {
        'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
        'phone': r'^\+?[\d\s\-\(\)]{10,15}$',
        'name': r'^[a-zA-Z\s\-\'\.]{2,50}$',
        'alphanumeric': r'^[a-zA-Z0-9_\-]{3,30}$',
        'sql_injection': r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)',
        'xss_patterns': r'(<script|javascript:|on\w+\s*=|<iframe|<object|<embed)',
    }
    
    @classmethod
    def validate_email(cls, email):
        """Enhanced email validation"""
        if not email:
            raise ValidationError("Email is required")
        
        # Basic format check
        if not re.match(cls.PATTERNS['email'], email):
            raise ValidationError("Invalid email format")
        
        # Django's built-in validator
        validator = EmailValidator()
        validator(email)
        
        # Check for suspicious patterns
        suspicious_patterns = ['admin@', 'root@', 'test@test', 'noreply@']
        if any(pattern in email.lower() for pattern in suspicious_patterns):
            logger.warning(f"Suspicious email registration attempt: {email}")
        
        return email.lower().strip()
    
    @classmethod
    def validate_password(cls, password, user=None):
        """Enhanced password validation"""
        if not password:
            raise ValidationError("Password is required")
        
        # Django's built-in validators
        validate_password(password, user)
        
        # Additional security checks
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long")
        
        if password.lower() in ['password', '12345678', 'qwerty123']:
            raise ValidationError("Password is too common")
        
        # Check for user info in password
        if user and user.email:
            email_parts = user.email.split('@')[0].lower()
            if email_parts in password.lower():
                raise ValidationError("Password cannot contain email address")
        
        return password
    
    @classmethod
    def validate_name(cls, name):
        """Validate user names"""
        if not name:
            return name
        
        name = name.strip()
        
        if len(name) < 2:
            raise ValidationError("Name must be at least 2 characters long")
        
        if len(name) > 50:
            raise ValidationError("Name cannot exceed 50 characters")
        
        if not re.match(cls.PATTERNS['name'], name):
            raise ValidationError("Name contains invalid characters")
        
        return name
    
    @classmethod
    def sanitize_input(cls, text, allow_html=False):
        """Sanitize user input to prevent XSS"""
        if not text:
            return text
        
        # Remove null bytes
        text = text.replace('\x00', '')
        
        if allow_html:
            # Allow only safe HTML tags
            allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li']
            text = bleach.clean(text, tags=allowed_tags, strip=True)
        else:
            # Strip all HTML tags
            text = strip_tags(text)
        
        # Check for XSS patterns
        if re.search(cls.PATTERNS['xss_patterns'], text, re.IGNORECASE):
            logger.warning(f"XSS attempt detected: {text[:100]}")
            raise ValidationError("Invalid input detected")
        
        return text.strip()
    
    @classmethod
    def check_sql_injection(cls, text):
        """Check for SQL injection patterns"""
        if not text:
            return text
        
        if re.search(cls.PATTERNS['sql_injection'], text, re.IGNORECASE):
            logger.warning(f"SQL injection attempt detected: {text[:100]}")
            raise ValidationError("Invalid input detected")
        
        return text
    
    @classmethod
    def validate_file_upload(cls, file):
        """Validate file uploads"""
        if not file:
            return file
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if file.size > max_size:
            raise ValidationError("File size cannot exceed 10MB")
        
        # Check file extension
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']
        file_extension = file.name.lower().split('.')[-1]
        if f'.{file_extension}' not in allowed_extensions:
            raise ValidationError("File type not allowed")
        
        # Check for executable files
        dangerous_extensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs']
        if f'.{file_extension}' in dangerous_extensions:
            raise ValidationError("Executable files are not allowed")
        
        return file
    
    @classmethod
    def generate_secure_token(cls, length=32):
        """Generate cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    @classmethod
    def hash_sensitive_data(cls, data):
        """Hash sensitive data for logging/storage"""
        return hashlib.sha256(data.encode()).hexdigest()[:16]

class RateLimitValidator:
    """Rate limiting validation"""
    
    @staticmethod
    def check_registration_rate(ip_address, email_domain):
        """Check if registration rate is suspicious"""
        # This would typically use Redis or database to track rates
        # For now, we'll implement basic checks
        
        # Check for common spam domains
        spam_domains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com']
        if any(domain in email_domain for domain in spam_domains):
            logger.warning(f"Registration from suspicious domain: {email_domain}")
            return False
        
        return True
    
    @staticmethod
    def check_login_attempts(user_id, ip_address):
        """Check for brute force login attempts"""
        # This would typically track failed attempts in Redis/database
        # Implementation would depend on your caching system
        return True

class DataPrivacyValidator:
    """GDPR/HIPAA compliance validators"""
    
    @staticmethod
    def validate_consent(user, data_type):
        """Validate user consent for data processing"""
        # Check if user has given consent for specific data processing
        # This would integrate with your consent management system
        return True
    
    @staticmethod
    def anonymize_data(data, fields_to_anonymize):
        """Anonymize sensitive data fields"""
        anonymized = data.copy()
        for field in fields_to_anonymize:
            if field in anonymized:
                anonymized[field] = SecurityValidator.hash_sensitive_data(str(anonymized[field]))
        return anonymized
    
    @staticmethod
    def validate_data_retention(model_instance, retention_days=2555):  # 7 years default
        """Check if data should be retained or deleted"""
        from datetime import datetime, timedelta
        
        if hasattr(model_instance, 'created_at'):
            retention_date = model_instance.created_at + timedelta(days=retention_days)
            return datetime.now() < retention_date
        
        return True