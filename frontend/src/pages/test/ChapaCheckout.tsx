import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ChapaCheckout() {
  const [searchParams] = useSearchParams();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const txRef = searchParams.get('tx_ref');
  const amount = searchParams.get('amount') || '1500';
  const merchant = searchParams.get('merchant') || '6469390';

  useEffect(() => {
    // If no transaction reference, redirect back
    if (!txRef) {
      navigate('/payment');
    }
  }, [txRef, navigate]);

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Simulate successful payment
      const returnUrl = `http://localhost:5173/payment/success?ref=${txRef}&status=success`;
      window.location.href = returnUrl;
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Chapa</h1>
          </div>
          <p className="text-gray-600">Secure Payment Gateway</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Secure Payment
            </CardTitle>
            <CardDescription className="text-blue-100">
              Complete your payment securely
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-800">Payment Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Merchant</span>
                <span className="font-medium">Mental Health App</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Merchant ID</span>
                <span className="font-mono text-xs">{merchant}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction</span>
                <span className="font-mono text-xs">{txRef}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Amount</span>
                <span className="font-bold text-blue-600 text-lg">ETB {amount}</span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card Number
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="4000 0000 0000 0002"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Use test card: 4000000000000002 for success
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Pay ETB {amount}
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCancel}
                disabled={processing}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel Payment
              </Button>
            </div>

            {/* Security Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                This is a test environment. No real money will be charged.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Mode Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Test Mode - Simulated Chapa Checkout
          </div>
        </div>
      </div>
    </div>
  );
}