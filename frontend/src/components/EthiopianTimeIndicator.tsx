import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getEthiopianTime, getEthiopianTimeZoneInfo } from '@/utils/ethiopianTime';

interface EthiopianTimeIndicatorProps {
  showFullTime?: boolean;
  className?: string;
}

export default function EthiopianTimeIndicator({ 
  showFullTime = false, 
  className = '' 
}: EthiopianTimeIndicatorProps) {
  const [currentTime, setCurrentTime] = useState<Date>(getEthiopianTime());
  const timeZoneInfo = getEthiopianTimeZoneInfo();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getEthiopianTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'UTC',
      hour: 'numeric',
      minute: '2-digit',
      second: showFullTime ? '2-digit' : undefined,
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
      <Clock className="w-4 h-4" />
      <div className="flex flex-col">
        <div className="font-medium">
          {formatTime(currentTime)}
        </div>
        {showFullTime && (
          <div className="text-xs text-gray-500">
            {formatDate(currentTime)} ({timeZoneInfo.abbreviation})
          </div>
        )}
      </div>
    </div>
  );
}