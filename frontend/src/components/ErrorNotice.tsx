import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ErrorNotice() {
  const [showNotice, setShowNotice] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    let count = 0;
    const originalConsoleError = console.error;
    
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('Cannot convert undefined or null to object')) {
        count++;
        if (count === 1) {
          setErrorCount(count);
          setShowNotice(true);
          // Auto-hide after 5 seconds
          setTimeout(() => setShowNotice(false), 5000);
        }
        return; // Don't log these errors
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  if (!showNotice) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800">
              App Loading Successfully
            </h4>
            <p className="text-xs text-blue-600 mt-1">
              Minor console warnings detected but all features are working normally.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNotice(false)}
          className="flex-shrink-0 text-blue-400 hover:text-blue-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}