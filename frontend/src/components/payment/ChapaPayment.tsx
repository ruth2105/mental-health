import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ChapaPaymentProps {
  amount: number;
  currency?: string;
  description?: string;
  appointmentId?: number;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
}

export default function ChapaPayment({
  amount,
  currency = 'ETB',
  description = 'Mental Health Session Payment',
  appointmentId,
  onSuccess,
  onError
}: ChapaPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { post } = useApi();

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStatus('processing');

    try {
      console.log('🔄 Initiating Chapa payment...', { amount, currency, appointmentId });

      const paymentData = {
        amount: amount,
        currency: currency,
        appointment_id: appointmentId,
        description: description
      };

      const response = await post('/payments/initiate/', paymentData);

      console.log('✅ Payment response:', response);

      if (response.success && response.checkout_url) {
        // Store payment reference for later verification
        localStorage.setItem('pending_payment_ref', response.payment_reference);
        localStorage.setItem('pending_chapa_tx_ref', response.chapa_tx_ref);

        // Redirect to Chapa checkout
        console.log('🔗 Redirecting to Chapa checkout:', response.checkout_url);
        window.location.href = response.checkout_url;
      } else {
        throw new Error(response.error || 'Payment initialization failed');
      }

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.details || 
                          error?.message || 
                          'Payment failed. Please try again.';

      setPaymentStatus('error');
      toast.error(`Payment failed: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Initializing payment...';
      case 'success':
        return 'Payment successful!';
      case 'error':
        return 'Payment failed';
      default:
        return 'Ready to pay';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Chapa Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="font-semibold text-lg">{currency} {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Description</span>
            <span className="text-sm">{description}</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">{getStatusMessage()}</p>
          
          <Button
            onClick={handlePayment}
            disabled={loading || paymentStatus === 'processing'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay with Chapa
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-center text-gray-500 space-y-1">
          <p>Secure payment powered by Chapa</p>
          <p>Supports all Ethiopian banks and mobile money</p>
        </div>
      </CardContent>
    </Card>
  );
}