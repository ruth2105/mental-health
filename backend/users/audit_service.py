"""
Service for creating audit logs
"""
from .audit_models import AuditLog


def log_activity(action, user=None, target_user=None, description="", 
                 ip_address=None, user_agent="", metadata=None):
    """
    Create an audit log entry
    
    Args:
        action: Action type from AuditLog.ACTION_CHOICES
        user: User performing the action
        target_user: User being affected (optional)
        description: Human-readable description
        ip_address: IP address of the request
        user_agent: User agent string
        metadata: Additional data as dict
    """
    return AuditLog.objects.create(
        user=user,
        action=action,
        target_user=target_user,
        description=description,
        ip_address=ip_address,
        user_agent=user_agent,
        metadata=metadata or {}
    )


def get_client_ip(request):
    """Extract client IP from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """Extract user agent from request"""
    return request.META.get('HTTP_USER_AGENT', '')
