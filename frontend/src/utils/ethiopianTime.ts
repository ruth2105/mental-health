/**
 * Ethiopian Time Utilities
 * Ethiopia uses East Africa Time (EAT) which is UTC+3
 */

/**
 * Get current Ethiopian time
 */
export function getEthiopianTime(): Date {
  const now = new Date();
  // Ethiopia is UTC+3 (East Africa Time)
  const ethiopianTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  return ethiopianTime;
}

/**
 * Get Ethiopian time greeting based on current hour
 */
export function getEthiopianGreeting(): string {
  const ethiopianTime = getEthiopianTime();
  const hour = ethiopianTime.getUTCHours();
  
  if (hour < 12) return 'Good Morning';
  else if (hour < 18) return 'Good Afternoon';
  else return 'Good Evening';
}

/**
 * Format Ethiopian time for display
 */
export function formatEthiopianTime(date?: Date): string {
  const ethiopianTime = date ? new Date(date.getTime() + (3 * 60 * 60 * 1000)) : getEthiopianTime();
  
  return ethiopianTime.toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format Ethiopian time for appointments
 */
export function formatEthiopianAppointmentTime(dateString: string): {
  date: string;
  time: string;
} {
  const appointmentDate = new Date(dateString);
  const ethiopianTime = new Date(appointmentDate.getTime() + (3 * 60 * 60 * 1000));
  
  const today = getEthiopianTime();
  const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
  
  let dateLabel: string;
  if (ethiopianTime.toDateString() === today.toDateString()) {
    dateLabel = 'Today';
  } else if (ethiopianTime.toDateString() === tomorrow.toDateString()) {
    dateLabel = 'Tomorrow';
  } else {
    dateLabel = ethiopianTime.toLocaleDateString('en-US', { 
      timeZone: 'UTC',
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  const timeLabel = ethiopianTime.toLocaleTimeString('en-US', { 
    timeZone: 'UTC',
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return {
    date: dateLabel,
    time: timeLabel
  };
}

/**
 * Get Ethiopian time zone info
 */
export function getEthiopianTimeZoneInfo(): {
  name: string;
  abbreviation: string;
  offset: string;
  utcOffset: number;
} {
  return {
    name: 'East Africa Time',
    abbreviation: 'EAT',
    offset: 'UTC+3',
    utcOffset: 3
  };
}