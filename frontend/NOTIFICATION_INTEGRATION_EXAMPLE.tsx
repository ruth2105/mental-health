/**
 * NOTIFICATION BELL INTEGRATION EXAMPLES
 * 
 * Copy these examples to add the notification bell to your pages
 */

// ============================================
// EXAMPLE 1: Patient Dashboard
// ============================================
import { useAuth } from '@/context/AuthContext';
import { NotificationBell } from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              EWKE
            </h1>
            
            {/* Add Notification Bell Here */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              <span className="text-sm text-gray-600">
                {user?.full_name || user?.email}
              </span>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Rest of your dashboard content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your dashboard content */}
      </main>
    </div>
  );
}


// ============================================
// EXAMPLE 2: Therapist Dashboard
// ============================================
import { NotificationBell } from '@/components/NotificationBell';

export default function TherapistDashboard() {
  return (
    <div className="min-h-screen">
      <nav className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="text-xl font-bold">Therapist Portal</div>
          
          {/* Notification Bell for Therapist */}
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button className="text-white hover:text-gray-200">
              Settings
            </button>
          </div>
        </div>
      </nav>
      
      {/* Dashboard content */}
    </div>
  );
}


// ============================================
// EXAMPLE 3: Shared Layout Component
// ============================================
import { NotificationBell } from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">EWKE</h1>
              <nav className="hidden md:flex gap-6">
                <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </a>
                <a href="/appointments" className="text-gray-600 hover:text-gray-900">
                  Appointments
                </a>
              </nav>
            </div>
            
            {/* Right side with notification bell */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  {user?.full_name}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}


// ============================================
// EXAMPLE 4: Simple Top Bar
// ============================================
import { NotificationBell } from '@/components/NotificationBell';

export function TopBar() {
  return (
    <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      
      <div className="flex items-center gap-3">
        {/* Just add the bell - it handles everything else! */}
        <NotificationBell />
      </div>
    </div>
  );
}


// ============================================
// EXAMPLE 5: Mobile-Friendly Header
// ============================================
import { NotificationBell } from '@/components/NotificationBell';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 py-3 flex justify-between items-center">
        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Logo */}
        <div className="text-lg font-bold">EWKE</div>
        
        {/* Notification Bell - works on mobile too! */}
        <NotificationBell />
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t">
          {/* Menu items */}
        </div>
      )}
    </header>
  );
}


// ============================================
// USAGE NOTES:
// ============================================

/**
 * The NotificationBell component is completely self-contained!
 * 
 * It automatically:
 * - Connects to WebSocket
 * - Shows unread count
 * - Displays notifications in dropdown
 * - Shows toast popups
 * - Handles reconnection
 * - Marks notifications as read
 * 
 * Just import and add it anywhere:
 * 
 * import { NotificationBell } from '@/components/NotificationBell';
 * 
 * <NotificationBell />
 * 
 * That's it! No props needed, no configuration required.
 */
