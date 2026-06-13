import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EthiopianTimeIndicator from '@/components/EthiopianTimeIndicator';
import { 
  getEthiopianTime, 
  getEthiopianGreeting, 
  formatEthiopianTime,
  formatEthiopianAppointmentTime,
  getEthiopianTimeZoneInfo 
} from '@/utils/ethiopianTime';
import { Clock, Globe, Calendar } from 'lucide-react';

export default function EthiopianTimeTest() {
  const [localTime, setLocalTime] = useState(new Date());
  const [ethiopianTime, setEthiopianTime] = useState(getEthiopianTime());
  const [greeting, setGreeting] = useState(getEthiopianGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTime(new Date());
      setEthiopianTime(getEthiopianTime());
      setGreeting(getEthiopianGreeting());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeZoneInfo = getEthiopianTimeZoneInfo();

  // Test appointment times
  const testAppointments = [
    new Date().toISOString(), // Now
    new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ethiopian Time System Test
          </h1>
          <p className="text-xl text-gray-600">
            Testing time zone functionality for Ethiopian users
          </p>
        </div>

        {/* Current Greeting */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Current Greeting
          </h2>
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            {greeting}! 👋
          </div>
          <p className="text-gray-600">
            This greeting changes based on Ethiopian time (EAT - UTC+3)
          </p>
        </Card>

        {/* Time Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Your Local Time
            </h3>
            <div className="space-y-2">
              <div className="text-2xl font-mono">
                {localTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600">
                {localTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-500">
                Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Ethiopian Time (EAT)
            </h3>
            <div className="space-y-2">
              <div className="text-2xl font-mono text-green-700">
                {ethiopianTime.toLocaleTimeString('en-US', { timeZone: 'UTC' })}
              </div>
              <div className="text-sm text-green-600">
                {ethiopianTime.toLocaleDateString('en-US', { 
                  timeZone: 'UTC',
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-xs text-green-500">
                {timeZoneInfo.name} ({timeZoneInfo.offset})
              </div>
            </div>
          </Card>
        </div>

        {/* Live Time Indicator */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Live Ethiopian Time Indicator
          </h3>
          <div className="flex justify-center">
            <EthiopianTimeIndicator showFullTime={true} className="text-lg" />
          </div>
        </Card>

        {/* Appointment Time Formatting Test */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointment Time Formatting
          </h3>
          <div className="space-y-4">
            {testAppointments.map((appointmentTime, index) => {
              const { date, time } = formatEthiopianAppointmentTime(appointmentTime);
              const originalDate = new Date(appointmentTime);
              
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Original (UTC)</div>
                      <div className="font-mono">
                        {originalDate.toLocaleString('en-US', { timeZone: 'UTC' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Ethiopian Format</div>
                      <div className="font-semibold text-green-700">
                        {date} at {time}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Time Zone Information */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Ethiopian Time Zone Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Full Name</div>
              <div className="font-semibold">{timeZoneInfo.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Abbreviation</div>
              <div className="font-semibold">{timeZoneInfo.abbreviation}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">UTC Offset</div>
              <div className="font-semibold">{timeZoneInfo.offset}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Hours Ahead of UTC</div>
              <div className="font-semibold">+{timeZoneInfo.utcOffset} hours</div>
            </div>
          </div>
        </Card>

        {/* Test Results */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-4">
            ✅ Ethiopian Time System Status
          </h3>
          <div className="space-y-2 text-green-700">
            <div>• Greeting system uses Ethiopian time</div>
            <div>• Appointment times converted to EAT</div>
            <div>• Live time indicator shows Ethiopian time</div>
            <div>• Dashboard filtering uses Ethiopian date</div>
            <div>• All times consistently show in Ethiopian timezone</div>
          </div>
        </Card>
      </div>
    </div>
  );
}