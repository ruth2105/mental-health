import { useState } from 'react';
import ChapaPayment from '@/components/payment/ChapaPayment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CleanChapaTest() {
  const [amount, setAmount] = useState(1500);
  const [description, setDescription] = useState('Test Mental Health Session');

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Clean Chapa Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (ETB)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ Clean Implementation Features:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Professional error handling</li>
                <li>• Proper logging and monitoring</li>
                <li>• Clean API structure</li>
                <li>• Real Chapa integration</li>
                <li>• Payment verification</li>
                <li>• Admin dashboard ready</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🔗 Test URLs:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Success:</strong> /payment/success</p>
                <p><strong>Webhook:</strong> /api/payments/webhook/</p>
                <p><strong>Verify:</strong> /api/payments/verify/</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Component */}
        <div>
          <ChapaPayment
            amount={amount}
            description={description}
            onSuccess={(data) => {
              console.log('Payment success:', data);
            }}
            onError={(error) => {
              console.error('Payment error:', error);
            }}
          />
        </div>
      </div>

      {/* Status Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📊 Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="font-semibold">Backend Ready</div>
              <div className="text-sm text-gray-600">Clean API endpoints</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="font-semibold">Chapa Connected</div>
              <div className="text-sm text-gray-600">Real API integration</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="font-semibold">Admin Dashboard</div>
              <div className="text-sm text-gray-600">Payment monitoring</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}