import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: ('patient' | 'therapist' | 'admin')[];
  // Backwards-compatible single role prop used elsewhere in the app
  role?: 'patient' | 'therapist' | 'admin';
}

const ProtectedRoute = ({ children, allowedRoles, role }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Normalize single `role` prop into allowedRoles array
  const roles = allowedRoles ?? (role ? [role] : undefined);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // If children are provided directly, render them (used in some places).
  // If this component is used as a route `element={<ProtectedRoute/>}` with nested
  // routes, React Router will render children via <Outlet /> — support both.
  if (children) return <>{children}</>;

  return <Outlet />;
};

export default ProtectedRoute;
