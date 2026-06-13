import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { post } = useApi();
  
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get payment reference from URL or localStorage
      const paymentRef = searchParams.get('ref') || localStorage.getItem('pending_payment_ref');
      const chapaRef = searchParams.get('trx_ref') || localStorage.getItem('pending_chapa_tx_ref');

      if (!paymentRef && !chapaRef) {
        setVerificationStatus('failed');
        toast.error('No payment reference found');
        return;
      }

      console.log('🔍 Verifying payment...', { paymentRef, chapaRef });

      const verificationData: any = {};
      if (paymentRef) verificationData.payment_reference = paymentRef;
      if (chapaRef) verificationData.tx_ref = chapaRef;

      const response = await post('/payments/verify/', verificationData);

      console.log('✅ Verification response:', response);

      if (response.success) {
        setPaymentData(response);
        setVerificationStatus('success');
        toast.success('Payment verified successfully!');
        
        // Clear stored references
        localStorage.removeItem('pending_payment_ref');
        localStorage.removeItem('pending_chapa_tx_ref');
        localStorage.removeItem('pending_appointment_id');
      } else {
        setVerificationStatus('failed');
        toast.error('Payment verification failed');
      }

    } catch (error: any) {
      console.error('❌ Verification error:', error);
      setVerificationStatus('failed');
      toast.error('Failed to verify payment');
    }
  };

  const handleContinue = () => {
    // Navigate to appointments or dashboard
    navigate('/appointments');
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Verifying Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment with Chapa...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold text-red-600">Payment Verification Failed</h2>
              <p className="text-muted-foreground">
                We couldn't verify your payment. Please contact support if you believe this is an error.
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/appointments')} className="w-full">
                  Go to Appointments
                </Button>
                <Button variant="outline" onClick={() => navigate('/support')} className="w-full">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="bg-green-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Thank you for your payment!</h3>
            <p className="text-muted-foreground">
              Your therapy session has been confirmed and paid for.
            </p>
          </div>

          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="font-semibold">{paymentData.currency} {paymentData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-green-600 font-medium capitalize">{paymentData.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reference</span>
                <span className="text-xs font-mono">{paymentData.tx_ref}</span>
              </div>
            </div>
          )}

          <Button onClick={handleContinue} className="w-full" size="lg">
            Continue to Appointments
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You will receive a confirmation email shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}