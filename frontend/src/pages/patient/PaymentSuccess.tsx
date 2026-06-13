import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NavigationHeader from '@/components/NavigationHeader';
import { CheckCircle2, XCircle, Loader2, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const { post } = useApi();
  const navigate = useNavigate();
  const { goTo } = useNavigationFlow();

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = searchParams.get('ref') || searchParams.get('reference');
      
      if (!reference) {
        setPaymentStatus('failed');
        toast.error('No payment reference found');
        return;
      }

      console.log('🔍 Verifying payment with reference:', reference);

      // Verify payment with backend
      const response = await post('/payments/verify/', { payment_reference: reference });
      
      console.log('✅ Payment verification response:', response);

      if (response.success && (response.status === 'success' || response.status === 'pending')) {
        setPaymentStatus('success');
        setPaymentDetails(response);
        toast.success('Payment verified successfully!');
        
        // Clear any pending appointment data
        localStorage.removeItem('pending_appointment_id');
      } else {
        setPaymentStatus('failed');
        toast.error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('❌ Payment verification error:', error);
      setPaymentStatus('failed');
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.detail || 
                          'Payment verification failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (paymentStatus === 'success') {
      goTo('/patient/dashboard');
    } else {
      goTo('/payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Verifying Payment</h3>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title={paymentStatus === 'success' ? "Payment Successful!" : "Payment Failed"}
        subtitle={paymentStatus === 'success' ? "Your therapy session has been confirmed" : "There was an issue processing your payment"}
        showBack={false}
        showBreadcrumbs={true}
      />
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <Card className="shadow-soft">
          <CardHeader className="text-center">
            {paymentStatus === 'success' ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
                <CardDescription>
                  Your therapy session has been confirmed and paid for.
                </CardDescription>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-red-700">Payment Failed</CardTitle>
                <CardDescription>
                  There was an issue processing your payment. Please try again.
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {paymentStatus === 'success' && paymentDetails && (
              <div className="bg-green-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-green-800">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">Reference</span>
                    <span className="font-mono text-green-800">{paymentDetails.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Amount</span>
                    <span className="font-semibold text-green-800">
                      {paymentDetails.currency} {paymentDetails.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Status</span>
                    <span className="font-semibold text-green-800 capitalize">
                      {paymentDetails.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === 'success' ? (
              <div className="space-y-4">
                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">What's Next?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Your appointment is now confirmed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      You'll receive a confirmation notification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Join your session at the scheduled time
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => goTo('/appointments')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Appointments
                  </Button>
                  <Button 
                    onClick={() => goTo('/patient/dashboard')}
                    className="flex-1 gradient-primary"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Payment Issues</h4>
                  <p className="text-sm text-red-600">
                    Your payment could not be processed. This might be due to:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-red-600">
                    <li>• Insufficient funds</li>
                    <li>• Card declined by bank</li>
                    <li>• Network connectivity issues</li>
                    <li>• Incorrect payment details</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => goTo('/payment')}
                    className="flex-1 gradient-primary"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => goTo('/patient/dashboard')}
                    variant="outline"
                    className="flex-1"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Need help? Contact our support team for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}