"""
Advanced encryption utilities for sensitive data
"""
import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
import hashlib
import secrets
import json
from datetime import datetime, timedelta


class FieldEncryption:
    """
    Handles field-level encryption for sensitive data like medical records,
    personal information, and chat messages
    """
    
    def __init__(self):
        self.key = self._get_or_create_key()
        self.fernet = Fernet(self.key)
    
    def _get_or_create_key(self):
        """Get encryption key from settings or environment"""
        # In production, this should come from a secure key management service
        secret_key = getattr(settings, 'FIELD_ENCRYPTION_KEY', None)
        
        if not secret_key:
            secret_key = os.environ.get('FIELD_ENCRYPTION_KEY')
        
        if not secret_key:
            # Generate a key for development (NOT for production)
            if settings.DEBUG:
                secret_key = base64.urlsafe_b64encode(os.urandom(32)).decode()
                print(f"⚠️ Generated temporary encryption key: {secret_key}")
                print("⚠️ Set FIELD_ENCRYPTION_KEY in production!")
            else:
                raise ImproperlyConfigured(
                    "FIELD_ENCRYPTION_KEY must be set in production"
                )
        
        # Derive key from secret
        if isinstance(secret_key, str):
            secret_key = secret_key.encode()
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'mental_health_salt',  # In production, use random salt per field
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(secret_key))
        return key
    
    def encrypt(self, data):
        """Encrypt sensitive data"""
        if data is None:
            return None
        
        if isinstance(data, str):
            data = data.encode('utf-8')
        elif not isinstance(data, bytes):
            data = str(data).encode('utf-8')
        
        encrypted = self.fernet.encrypt(data)
        return base64.urlsafe_b64encode(encrypted).decode('utf-8')
    
    def decrypt(self, encrypted_data):
        """Decrypt sensitive data"""
        if not encrypted_data:
            return None
        
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode('utf-8'))
            decrypted = self.fernet.decrypt(encrypted_bytes)
            return decrypted.decode('utf-8')
        except Exception as e:
            # Log the error but don't expose details
            print(f"Decryption failed: {type(e).__name__}")
            return None


class SecureTokenGenerator:
    """
    Generate secure tokens for various purposes (password reset, email verification, etc.)
    """
    
    @staticmethod
    def generate_secure_token(length=32):
        """Generate cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def generate_otp(length=6):
        """Generate numeric OTP"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(length)])
    
    @staticmethod
    def hash_token(token):
        """Hash token for secure storage"""
        return hashlib.sha256(token.encode()).hexdigest()


class DataMasking:
    """
    Mask sensitive data for logging and display
    """
    
    @staticmethod
    def mask_email(email):
        """Mask email address"""
        if not email or '@' not in email:
            return email
        
        local, domain = email.split('@', 1)
        if len(local) <= 2:
            masked_local = '*' * len(local)
        else:
            masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
        
        return f"{masked_local}@{domain}"
    
    @staticmethod
    def mask_phone(phone):
        """Mask phone number"""
        if not phone:
            return phone
        
        phone = ''.join(filter(str.isdigit, phone))
        if len(phone) < 4:
            return '*' * len(phone)
        
        return phone[:2] + '*' * (len(phone) - 4) + phone[-2:]
    
    @staticmethod
    def mask_medical_id(medical_id):
        """Mask medical ID"""
        if not medical_id:
            return medical_id
        
        if len(medical_id) <= 4:
            return '*' * len(medical_id)
        
        return medical_id[:2] + '*' * (len(medical_id) - 4) + medical_id[-2:]


class SecureSessionManager:
    """
    Enhanced session security
    """
    
    @staticmethod
    def create_session_fingerprint(request):
        """Create session fingerprint for additional security"""
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        accept_language = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
        accept_encoding = request.META.get('HTTP_ACCEPT_ENCODING', '')
        
        fingerprint_data = f"{user_agent}:{accept_language}:{accept_encoding}"
        return hashlib.sha256(fingerprint_data.encode()).hexdigest()
    
    @staticmethod
    def validate_session_fingerprint(request, stored_fingerprint):
        """Validate session fingerprint"""
        current_fingerprint = SecureSessionManager.create_session_fingerprint(request)
        return current_fingerprint == stored_fingerprint


# Global instances
field_encryption = FieldEncryption()
token_generator = SecureTokenGenerator()
data_masking = DataMasking()
session_manager = SecureSessionManager()