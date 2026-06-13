import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Navigation flow mapping - defines the logical flow between pages
 */
const NAVIGATION_FLOW = {
  // Therapist browsing flow
  '/therapists': '/',
  '/therapists/:id': '/therapists',
  '/therapists/:id/book': '/therapists/:id',
  
  // Booking and payment flow
  '/payment': '/therapists/:id/book',
  '/payment/success': '/payment',
  
  // Appointment management
  '/appointments': '/patient/dashboard',
  '/appointments/:id': '/appointments',
  '/appointments/:appointmentId/feedback': '/appointments/:id',
  
  // Session flow
  '/session/:appointmentId': '/appointments/:id',
  '/session/:appointmentId/complete': '/session/:appointmentId',
  
  // Patient dashboard flow
  '/patient/dashboard': '/',
  '/patient/progress': '/patient/dashboard',
  '/patient/settings': '/patient/dashboard',
  '/payment-history': '/patient/dashboard',
  
  // Assessment flow
  '/assessment': '/patient/dashboard',
  '/assessment/result': '/assessment',
  
  // Therapist dashboard flow
  '/therapist/dashboard': '/',
  '/therapist/patients': '/therapist/dashboard',
  '/therapist/patients/:id': '/therapist/patients',
  '/therapist/appointments': '/therapist/dashboard',
  '/therapist/appointments/:appointmentId': '/therapist/appointments',
  '/therapist/appointments/:appointmentId/notes': '/therapist/appointments/:appointmentId',
  '/therapist/progress': '/therapist/dashboard',
  '/therapist/settings': '/therapist/dashboard',
  
  // Admin flow
  '/admin/dashboard': '/',
  '/admin/therapists/approvals': '/admin/dashboard',
  '/admin/manage-admins': '/admin/dashboard',
  
  // Auth flow
  '/login': '/',
  '/register': '/',
  '/forgot-password': '/login',
};

/**
 * Custom hook for managing navigation flow with proper back navigation
 */
export function useNavigationFlow() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate back in the logical flow
   */
  const goBack = useCallback(() => {
    const currentPath = location.pathname;
    
    // Check if there's a stored previous path in state
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    
    // Find the previous page in the navigation flow
    const previousPath = findPreviousPath(currentPath);
    
    if (previousPath) {
      navigate(previousPath);
    } else {
      // Fallback to browser back or dashboard
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigate('/patient/dashboard');
      }
    }
  }, [location, navigate]);

  /**
   * Navigate forward with flow context
   */
  const goTo = useCallback((path: string, options?: { replace?: boolean; state?: any }) => {
    const state = {
      from: location.pathname,
      ...options?.state
    };
    
    navigate(path, {
      replace: options?.replace,
      state
    });
  }, [location.pathname, navigate]);

  /**
   * Navigate to a specific page in the booking flow
   */
  const goToBookingFlow = useCallback((therapistId: string, step: 'profile' | 'book' | 'payment' | 'success') => {
    const paths = {
      profile: `/therapists/${therapistId}`,
      book: `/therapists/${therapistId}/book`,
      payment: '/payment',
      success: '/payment/success'
    };
    
    goTo(paths[step]);
  }, [goTo]);

  /**
   * Navigate to appointment flow
   */
  const goToAppointmentFlow = useCallback((appointmentId: string, step: 'detail' | 'session' | 'feedback' | 'complete') => {
    const paths = {
      detail: `/appointments/${appointmentId}`,
      session: `/session/${appointmentId}`,
      feedback: `/appointments/${appointmentId}/feedback`,
      complete: `/session/${appointmentId}/complete`
    };
    
    goTo(paths[step]);
  }, [goTo]);

  return {
    goBack,
    goTo,
    goToBookingFlow,
    goToAppointmentFlow,
    currentPath: location.pathname
  };
}

/**
 * Find the previous path in the navigation flow
 */
function findPreviousPath(currentPath: string): string | null {
  // Direct match
  if (NAVIGATION_FLOW[currentPath as keyof typeof NAVIGATION_FLOW]) {
    return NAVIGATION_FLOW[currentPath as keyof typeof NAVIGATION_FLOW];
  }
  
  // Pattern matching for dynamic routes
  for (const [pattern, previousPath] of Object.entries(NAVIGATION_FLOW)) {
    if (matchesPattern(currentPath, pattern)) {
      return resolveDynamicPath(previousPath, currentPath, pattern);
    }
  }
  
  return null;
}

/**
 * Check if a path matches a pattern with parameters
 */
function matchesPattern(path: string, pattern: string): boolean {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  if (patternParts.length !== pathParts.length) {
    return false;
  }
  
  return patternParts.every((part, index) => {
    return part.startsWith(':') || part === pathParts[index];
  });
}

/**
 * Resolve dynamic paths by replacing parameters
 */
function resolveDynamicPath(targetPattern: string, currentPath: string, sourcePattern: string): string {
  const sourceParams = extractParams(currentPath, sourcePattern);
  
  let resolvedPath = targetPattern;
  for (const [key, value] of Object.entries(sourceParams)) {
    resolvedPath = resolvedPath.replace(`:${key}`, value);
  }
  
  return resolvedPath;
}

/**
 * Extract parameters from a path using a pattern
 */
function extractParams(path: string, pattern: string): Record<string, string> {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  const params: Record<string, string> = {};
  
  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1);
      params[paramName] = pathParts[index];
    }
  });
  
  return params;
}

/**
 * Get breadcrumb navigation for current path
 */
export function useBreadcrumbs() {
  const location = useLocation();
  
  const getBreadcrumbs = useCallback(() => {
    const path = location.pathname;
    const breadcrumbs: Array<{ label: string; path: string }> = [];
    
    // Build breadcrumbs based on current path
    if (path.startsWith('/therapists/') && path.includes('/book')) {
      breadcrumbs.push(
        { label: 'Home', path: '/' },
        { label: 'Therapists', path: '/therapists' },
        { label: 'Therapist Profile', path: path.replace('/book', '') },
        { label: 'Book Appointment', path: path }
      );
    } else if (path.startsWith('/therapists/') && !path.includes('/book')) {
      breadcrumbs.push(
        { label: 'Home', path: '/' },
        { label: 'Therapists', path: '/therapists' },
        { label: 'Therapist Profile', path: path }
      );
    } else if (path === '/payment') {
      breadcrumbs.push(
        { label: 'Home', path: '/' },
        { label: 'Therapists', path: '/therapists' },
        { label: 'Book Appointment', path: '#' },
        { label: 'Payment', path: path }
      );
    } else if (path === '/payment/success') {
      breadcrumbs.push(
        { label: 'Home', path: '/' },
        { label: 'Therapists', path: '/therapists' },
        { label: 'Payment', path: '/payment' },
        { label: 'Success', path: path }
      );
    }
    
    return breadcrumbs;
  }, [location.pathname]);
  
  return { getBreadcrumbs };
}