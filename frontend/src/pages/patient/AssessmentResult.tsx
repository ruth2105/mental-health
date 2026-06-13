import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function AssessmentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get AI prediction results
  const prediction = location.state?.prediction || 'Unknown';
  const confidence = location.state?.confidence || 0;
  const recommendation = location.state?.recommendation || 'Please consult with a therapist for proper evaluation.';

  // If no results, redirect back to assessment
  if (!location.state?.prediction) {
    navigate('/assessment');
    return null;
  }

  // Map disorder names to user-friendly names
  const disorderNames: Record<string, string> = {
    'MDD': 'Major Depressive Disorder',
    'ASD': 'Autism Spectrum Disorder',
    'Loneliness': 'Chronic Loneliness',
    'bipolar': 'Bipolar Disorder',
    'anexiety': 'Anxiety Disorder',
    'PTSD': 'Post-Traumatic Stress Disorder',
    'sleeping disorder': 'Sleep Disorder',
    'psychotic deprission': 'Psychotic Depression',
    'eating disorder': 'Eating Disorder',
    'ADHD': 'Attention Deficit Hyperactivity Disorder',
    'PDD': 'Persistent Depressive Disorder',
    'OCD': 'Obsessive-Compulsive Disorder'
  };

  const disorderName = disorderNames[prediction] || prediction;
  const confidencePercent = (confidence * 100).toFixed(1);

  const getSeverityIcon = () => {
    // Determine severity based on confidence and disorder type
    const severeDisorders = ['MDD', 'PTSD', 'psychotic deprission', 'bipolar'];
    const moderateDisorders = ['anexiety', 'OCD', 'PDD', 'eating disorder'];
    
    if (severeDisorders.includes(prediction) || confidence > 0.95) {
      return <AlertCircle className="h-12 w-12 text-destructive" />;
    } else if (moderateDisorders.includes(prediction) || confidence > 0.85) {
      return <Info className="h-12 w-12 text-orange-500" />;
    } else {
      return <CheckCircle className="h-12 w-12 text-green-500" />;
    }
  };

  const getSeverityMessage = () => {
    const severeDisorders = ['MDD', 'PTSD', 'psychotic deprission', 'bipolar'];
    const moderateDisorders = ['anexiety', 'OCD', 'PDD', 'eating disorder'];
    
    if (severeDisorders.includes(prediction)) {
      return 'We recommend seeking professional help as soon as possible. This condition benefits greatly from professional treatment.';
    } else if (moderateDisorders.includes(prediction)) {
      return 'Regular therapy sessions could significantly help manage your symptoms and improve your quality of life.';
    } else {
      return 'Professional guidance can help you develop coping strategies and maintain your mental wellbeing.';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-elegant">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              {getSeverityIcon()}
            </div>
            <CardTitle className="text-3xl">Assessment Results</CardTitle>
            <CardDescription className="text-base">
              Based on your responses, our AI analysis indicates: <strong>{disorderName}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">AI Confidence Level</h3>
                <span className="text-lg font-bold text-primary">{confidencePercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This indicates how confident our AI model is in this assessment
              </p>
            </div>

            <div className="bg-card/50 p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">What This Means</h3>
              <p className="text-muted-foreground">{getSeverityMessage()}</p>
            </div>

            <div className="bg-card/50 p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">AI Recommendation</h3>
              <p className="text-muted-foreground">{recommendation}</p>
            </div>

            <div className="bg-card/50 p-6 rounded-lg border">
              <h3 className="font-semibold mb-3">Recommended Next Steps</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Connect with one of our verified therapists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Schedule regular therapy sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Practice self-care and mindfulness techniques</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/therapists')} 
                className="flex-1 gradient-primary"
              >
                Find a Therapist
              </Button>
              <Button 
                onClick={() => navigate('/patient/dashboard')} 
                variant="outline" 
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
