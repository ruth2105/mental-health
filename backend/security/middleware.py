"""
Security Middleware for Mental Health Application
Implements comprehensive security measures
"""
import logging
import time
import json
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth import get_user_model
from .validators import SecurityValidator
import re

User = get_user_model()
logger = logging.getLogger(__name__)

class SecurityMiddleware(MiddlewareMixin):
    """Comprehensive security middleware"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
    
    def process_request(self, request):
        """Process incoming requests for security threats"""
        
        # Get client IP
        ip_address = self.get_client_ip(request)
        request.client_ip = ip_address
        
        # Check for blocked IPs
        if self.is_ip_blocked(ip_address):
            logger.warning(f"Blocked IP attempted access: {ip_address}")
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        # Rate limiting
        if self.is_rate_limited(request, ip_address):
            logger.warning(f"Rate limit exceeded for IP: {ip_address}")
            return JsonResponse({'error': 'Rate limit exceeded'}, status=429)
        
        # Check for malicious patterns in URL
        if self.has_malicious_patterns(request.path):
            logger.warning(f"Malicious URL pattern detected: {request.path}")
            return JsonResponse({'error': 'Invalid request'}, status=400)
        
        # Validate request size
        if self.is_request_too_large(request):
            logger.warning(f"Request too large from IP: {ip_address}")
            return JsonResponse({'error': 'Request too large'}, status=413)
        
        return None
    
    def process_response(self, request, response):
        """Add security headers to response"""
        
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # HSTS for HTTPS
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' ws: wss:; "
            "media-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        response['Content-Security-Policy'] = csp
        
        return response
    
    def get_client_ip(self, request):
        """Get real client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def is_ip_blocked(self, ip_address):
        """Check if IP is in blocklist"""
        # Check cache for blocked IPs
        blocked_ips = cache.get('blocked_ips', set())
        return ip_address in blocked_ips
    
    def is_rate_limited(self, request, ip_address):
        """Implement rate limiting"""
        # Different limits for different endpoints
        limits = {
            '/api/users/login/': (5, 300),  # 5 attempts per 5 minutes
            '/api/users/register/': (3, 3600),  # 3 registrations per hour
            '/api/payments/': (10, 3600),  # 10 payment attempts per hour
        }
        
        for endpoint, (max_requests, window) in limits.items():
            if request.path.startswith(endpoint):
                cache_key = f"rate_limit:{ip_address}:{endpoint}"
                current_requests = cache.get(cache_key, 0)
                
                if current_requests >= max_requests:
                    return True
                
                # Increment counter
                cache.set(cache_key, current_requests + 1, window)
                break
        
        return False
    
    def has_malicious_patterns(self, path):
        """Check for malicious URL patterns"""
        malicious_patterns = [
            r'\.\./',  # Directory traversal
            r'<script',  # XSS attempts
            r'union.*select',  # SQL injection
            r'exec\(',  # Code execution
            r'eval\(',  # Code evaluation
            r'system\(',  # System commands
        ]
        
        for pattern in malicious_patterns:
            if re.search(pattern, path, re.IGNORECASE):
                return True
        
        return False
    
    def is_request_too_large(self, request):
        """Check if request body is too large"""
        max_size = getattr(settings, 'MAX_REQUEST_SIZE', 10 * 1024 * 1024)  # 10MB default
        
        content_length = request.META.get('CONTENT_LENGTH')
        if content_length and int(content_length) > max_size:
            return True
        
        return False

class AuditLogMiddleware(MiddlewareMixin):
    """Audit logging middleware for compliance"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
    
    def process_request(self, request):
        """Log request details"""
        request.start_time = time.time()
        
        # Log sensitive operations
        sensitive_endpoints = [
            '/api/users/login/',
            '/api/users/register/',
            '/api/payments/',
            '/api/appointments/',
            '/api/chat/',
            '/api/video/',
        ]
        
        if any(request.path.startswith(endpoint) for endpoint in sensitive_endpoints):
            self.log_request(request)
        
        return None
    
    def process_response(self, request, response):
        """Log response details"""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Log failed authentication attempts
            if (request.path.startswith('/api/users/login/') and 
                response.status_code in [401, 403]):
                self.log_failed_login(request, response)
            
            # Log successful operations
            if response.status_code < 400:
                self.log_successful_operation(request, response, duration)
        
        return response
    
    def log_request(self, request):
        """Log incoming request"""
        user_id = None
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_id = request.user.id
        
        log_data = {
            'timestamp': time.time(),
            'ip_address': getattr(request, 'client_ip', 'unknown'),
            'user_id': user_id,
            'method': request.method,
            'path': request.path,
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }
        
        logger.info(f"API_REQUEST: {json.dumps(log_data)}")
    
    def log_failed_login(self, request, response):
        """Log failed login attempts"""
        try:
            request_data = json.loads(request.body) if request.body else {}
            email = request_data.get('email', 'unknown')
        except:
            email = 'unknown'
        
        log_data = {
            'timestamp': time.time(),
            'ip_address': getattr(request, 'client_ip', 'unknown'),
            'email': SecurityValidator.hash_sensitive_data(email),
            'status_code': response.status_code,
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }
        
        logger.warning(f"FAILED_LOGIN: {json.dumps(log_data)}")
    
    def log_successful_operation(self, request, response, duration):
        """Log successful operations"""
        if hasattr(request, 'user') and request.user.is_authenticated:
            log_data = {
                'timestamp': time.time(),
                'user_id': request.user.id,
                'user_role': request.user.role,
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration': round(duration, 3),
            }
            
            logger.info(f"SUCCESSFUL_OPERATION: {json.dumps(log_data)}")

class DataProtectionMiddleware(MiddlewareMixin):
    """GDPR/HIPAA compliance middleware"""
    
    def process_response(self, request, response):
        """Ensure data protection compliance"""
        
        # Add privacy headers
        response['Privacy-Policy'] = '/privacy-policy'
        response['Data-Retention'] = '7-years'
        
        # Mask sensitive data in responses (for logging)
        if hasattr(response, 'content') and response.get('Content-Type', '').startswith('application/json'):
            try:
                # This would implement data masking for audit logs
                pass
            except:
                pass
        
        return response