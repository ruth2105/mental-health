import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group-fallback';
import NavigationHeader from '@/components/NavigationHeader';
import { CreditCard, Smartphone, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AppointmentDetails {
  id: number;
  therapist: {
    full_name: string;
    email: string;
  };
  scheduled_time: string;
  price?: number;
}

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingAppointment, setFetchingAppointment] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const { post, get } = useApi();
  const navigate = useNavigate();
  const { goBack } = useNavigationFlow();

  useEffect(() => {
    fetchAppointmentDetails();
  }, []);

  const fetchAppointmentDetails = async () => {
    try {
      const appointmentId = localStorage.getItem('pending_appointment_id');
      if (!appointmentId) {
        toast.error('No appointment found. Please book an appointment first.');
        navigate('/therapists');
        return;
      }

      const data = await get(`/appointments/${appointmentId}/`);
      setAppointment(data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
    } finally {
      setFetchingAppointment(false);
    }
  };

  const handlePayment = async () => {
    if (!appointment) {
      toast.error('Appointment details not loaded');
      return;
    }

    setLoading(true);
    try {
      const appointmentId = localStorage.getItem('pending_appointment_id');
      console.log('💳 Processing payment for appointment:', appointmentId);
      
      // Check authentication
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      console.log('🔐 Auth token exists:', !!token);
      console.log('🔐 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Get price from appointment or use default
      const amount = appointment.price || 1500;
      
      const paymentData = {
        payment_method: paymentMethod,
        amount: amount,
        appointment_id: appointmentId ? parseInt(appointmentId) : undefined,
        card_number: paymentMethod === 'card' ? cardNumber : undefined,
        phone_number: paymentMethod !== 'card' ? phone : undefined,
      };
      
      console.log('💳 Sending payment request:', paymentData);
      console.log('🔗 API URL:', `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/payments/initiate/`);
      
      const response = await post('/payments/initiate/', paymentData);
      
      console.log('✅ Payment response:', response);
      
      if (response.success && response.checkout_url) {
        // Store payment reference for verification
        localStorage.setItem('pending_payment_ref', response.payment_reference);
        localStorage.setItem('pending_chapa_tx_ref', response.chapa_tx_ref);
        
        // Redirect to real Chapa checkout
        console.log('🔗 Redirecting to Chapa:', response.checkout_url);
        window.location.href = response.checkout_url;
      } else {
        throw new Error(response.error || 'Payment initialization failed');
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText
      });
      
      // Show more specific error message
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.detail || 
                          error?.message || 
                          'Payment failed. Please try again.';
      
      toast.error(`Payment failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingAppointment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No appointment found. Please book an appointment first.
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

  const appointmentDate = new Date(appointment.scheduled_time);
  const formattedDate = format(appointmentDate, 'MMM dd, yyyy');
  const formattedTime = format(appointmentDate, 'hh:mm a');
  const amount = appointment.price || 1500;

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="Complete Payment"
        subtitle="Secure payment for your therapy session"
        showBreadcrumbs={true}
        customBackAction={() => {
          // Go back to booking page with therapist context
          const appointmentId = localStorage.getItem('pending_appointment_id');
          if (appointmentId) {
            goBack();
          } else {
            navigate('/therapists');
          }
        }}
      />
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <Card className="shadow-soft">
          <CardContent className="space-y-6">
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Session Confirmed
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Therapist</span>
                  <span className="font-medium">{appointment.therapist.full_name || appointment.therapist.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">{formattedDate} at {formattedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">50 minutes</span>
                </div>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-primary text-lg">ETB {amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-smooth cursor-pointer">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 flex-1 cursor-pointer">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-smooth cursor-pointer">
                  <RadioGroupItem value="telebirr" id="telebirr" />
                  <Label htmlFor="telebirr" className="flex items-center gap-2 flex-1 cursor-pointer">
                    <Smartphone className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Telebirr</p>
                      <p className="text-xs text-muted-foreground">Pay with Telebirr</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-smooth cursor-pointer">
                  <RadioGroupItem value="chapa" id="chapa" />
                  <Label htmlFor="chapa" className="flex items-center gap-2 flex-1 cursor-pointer">
                    <Smartphone className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="font-medium">Chapa</p>
                      <p className="text-xs text-muted-foreground">Pay with Chapa</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" type="password" maxLength={3} />
                  </div>
                </div>
              </div>
            )}

            {(paymentMethod === 'telebirr' || paymentMethod === 'chapa') && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+251 912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            <Button 
              className="w-full gradient-primary" 
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay ETB 1,500'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your payment is secure and encrypted. By proceeding, you agree to our Terms of Service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
