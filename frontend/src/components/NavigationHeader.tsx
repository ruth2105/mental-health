import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationFlow, useBreadcrumbs } from '@/hooks/useNavigationFlow';

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showBreadcrumbs?: boolean;
  customBackAction?: () => void;
  className?: string;
}

export default function NavigationHeader({
  title,
  subtitle,
  showBack = true,
  showBreadcrumbs = false,
  customBackAction,
  className = ''
}: NavigationHeaderProps) {
  const { goBack } = useNavigationFlow();
  const { getBreadcrumbs } = useBreadcrumbs();

  const handleBack = () => {
    if (customBackAction) {
      customBackAction();
    } else {
      goBack();
    }
  };

  const breadcrumbs = showBreadcrumbs ? getBreadcrumbs() : [];

  return (
    <div className={`bg-white/90 backdrop-blur-sm shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumbs */}
        {showBreadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm mb-2 text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {crumb.path === '#' ? (
                  <span className="text-gray-700">{crumb.label}</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = crumb.path}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    {crumb.label}
                  </Button>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Header with back button */}
        <div className="flex items-center gap-4">
          {showBack && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}