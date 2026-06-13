import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import NavigationHeader from '@/components/NavigationHeader';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Therapist {
  id: number;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  specialization: string;
  price: number;
}

export default function BookAppointment() {
  const { id: therapistProfileId } = useParams();
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingTherapist, setFetchingTherapist] = useState(true);
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const { post, get } = useApi();
  const navigate = useNavigate();
  const { goTo } = useNavigationFlow();

  // Available time slots (9 AM to 5 PM, hourly)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Fetch therapist details to get user ID
  useEffect(() => {
    if (therapistProfileId) {
      fetchTherapist();
    }
  }, [therapistProfileId]);

  const fetchTherapist = async () => {
    setFetchingTherapist(true);
    try {
      const data = await get(`/users/therapists/${therapistProfileId}/`);
      setTherapist(data);
    } catch (error: any) {
      console.error('Error fetching therapist:', error);
      toast.error('Failed to load therapist details');
      setTimeout(() => navigate('/therapists'), 2000);
    } finally {
      setFetchingTherapist(false);
    }
  };

  // Show loading state while fetching therapist
  if (fetchingTherapist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Validate therapist data
  if (!therapist || !therapistProfileId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Invalid therapist. Please select a therapist first.
            </p>
            <Button 
              onClick={() => navigate('/therapists')}
              className="w-full mt-4"
            >
              Browse Therapists
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    if (!selectedTime) {
      toast.error('Please select a time');
      return;
    }

    if (!therapist?.user?.id) {
      toast.error('Invalid therapist information');
      return;
    }

    // Combine date and time
    const [hours, minutes] = selectedTime.split(':');
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    setLoading(true);
    try {
      console.log('Booking appointment with:', {
        therapist_id: therapist.user.id,
        scheduled_time: appointmentDateTime.toISOString(),
      });

      const response = await post('/appointments/', {
        therapist_id: therapist.user.id,
        scheduled_time: appointmentDateTime.toISOString(),
      });
      
      console.log('Booking response:', response);
      
      toast.success('Appointment booked successfully!');
      // Store appointment ID for payment
      localStorage.setItem('pending_appointment_id', response.id);
      goTo('/payment');
    } catch (error: any) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMsg = 'Failed to book appointment. Please try again.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.scheduled_time) {
          // Handle time slot conflict error
          errorMsg = Array.isArray(error.response.data.scheduled_time) 
            ? error.response.data.scheduled_time[0]
            : error.response.data.scheduled_time;
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else if (error.response.data.therapist_id) {
          errorMsg = `Therapist error: ${error.response.data.therapist_id[0]}`;
        }
      }
      
      toast.error(errorMsg, {
        duration: 5000, // Show for 5 seconds since it's important
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="Book Your Session"
        subtitle="Choose a convenient date and time for your therapy session"
        showBreadcrumbs={true}
      />
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <Card className="shadow-soft">
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setSelectedTime(''); // Reset time when date changes
                  }}
                  disabled={(date) => date < new Date()}
                  className="rounded-lg border shadow-soft pointer-events-auto"
                />
              </div>
              {date && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Selected Date: {format(date, 'PPP')}
                </p>
              )}
            </div>

            {date && (
              <div className="space-y-2">
                <Label>Select Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTime === time
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {selectedTime && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Selected Time: {selectedTime}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific topics or concerns you'd like to discuss..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Session Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Therapist</span>
                <span className="font-medium">{therapist.user.full_name || therapist.user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Specialization</span>
                <span className="font-medium">{therapist.specialization}</span>
              </div>
              {date && selectedTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Scheduled</span>
                  <span className="font-medium">
                    {format(date, 'MMM dd, yyyy')} at {selectedTime}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">50 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Session Fee</span>
                <span className="font-medium">ETB {therapist.price || '1,500'}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">ETB {therapist.price || '1,500'}</span>
              </div>
            </div>

            <Button 
              className="w-full gradient-primary" 
              onClick={handleSubmit}
              disabled={loading || !date || !selectedTime}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {loading ? 'Booking...' : !date ? 'Select Date First' : !selectedTime ? 'Select Time' : 'Proceed to Payment'}
            </Button>
            
            {!date && (
              <p className="text-sm text-center text-muted-foreground">
                Please select a date to continue
              </p>
            )}
            {date && !selectedTime && (
              <p className="text-sm text-center text-muted-foreground">
                Please select a time slot to continue
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
