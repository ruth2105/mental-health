import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group-fallback';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorTest() {
  const [value, setValue] = useState<string>("");
  const [undefinedValue, setUndefinedValue] = useState<string | undefined>(undefined);

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Normal RadioGroup</h3>
            <RadioGroup value={value} onValueChange={setValue}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option1" id="option1" />
                <Label htmlFor="option1">Option 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option2" id="option2" />
                <Label htmlFor="option2">Option 2</Label>
              </div>
            </RadioGroup>
            <p className="mt-2 text-sm text-muted-foreground">Selected: {value || "None"}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">RadioGroup with Undefined Value</h3>
            <RadioGroup value={undefinedValue} onValueChange={setUndefinedValue}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="test1" id="test1" />
                <Label htmlFor="test1">Test 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="test2" id="test2" />
                <Label htmlFor="test2">Test 2</Label>
              </div>
            </RadioGroup>
            <p className="mt-2 text-sm text-muted-foreground">Selected: {undefinedValue || "None"}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800 font-semibold">✅ If you can see this page without JavaScript errors, the fixes are working!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}