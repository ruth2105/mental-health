import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mentalHealthService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group-fallback';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const QUESTIONS = [
  "Over the past 2 weeks, how often have you felt little interest or pleasure in doing things?",
  "How often have you been bothered by feeling down, depressed, or hopeless?",
  "How often have you had trouble falling or staying asleep, or sleeping too much?",
  "Over the past 2 weeks, how often have you felt tired or had little energy?",
  "How often have you been bothered by poor appetite or overeating?",
  "How often have you felt bad about yourself, or that you are a failure or have let yourself or your family down?",
  "How often have you had trouble concentrating on things, such as reading the newspaper or watching television?",
  "How often have you been bothered by feeling nervous, anxious, or on edge?",
  "How often have you not been able to stop or control worrying?",
  "How often have you been worrying too much about different things?",
  "How often have you had trouble relaxing?",
  "How often have you been so restless that it is hard to sit still?",
  "How often have you become easily annoyed or irritable?",
  "How often have you felt afraid as if something awful might happen?",
  "Have you experienced a decreased need for sleep?",
  "Have you been more talkative or felt pressure to keep talking?",
  "Have you had racing thoughts or a flight of ideas?",
  "Are you more easily distracted than usual?",
  "Have you had a noticeable increase in goal-directed activity (socially, at work, or sexually)?",
  "Have you engaged in activities with a high potential for painful consequences?",
  "Have you felt persistently sad or empty?",
  "Have you lost interest in activities you once enjoyed?",
  "Have you experienced significant weight loss or gain, or a decrease or increase in appetite?",
  "Have you felt slowed down or restless almost every day?",
  "Have you had feelings of worthlessness or excessive guilt?",
  "Have you had recurrent thoughts of death or suicide?",
  "Do you find it difficult to handle your daily responsibilities due to stress?",
  "Do you feel overwhelmed and unable to cope?",
  "Have you been feeling jumpy or easily startled?"
];

const ANSWER_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Rarely" }
];

export default function Assessment() {
  const [answers, setAnswers] = useState<number[]>(Array(29).fill(-1));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const isAnswered = answers[currentQuestion] !== -1;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!isAnswered) {
      toast.error('Please select an answer');
      return;
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.some(a => a === -1)) {
      toast.error('Please answer all questions');
      return;
    }

    setLoading(true);
    try {
      const result = await mentalHealthService.predict(answers);
      
      // Navigate to results page with the prediction data
      navigate('/assessment/result', { 
        state: {
          prediction: result.prediction,
          confidence: result.confidence,
          recommendation: result.recommendation
        }
      });
      
      toast.success('Assessment complete!');
    } catch (error: any) {
      console.error('Assessment error:', error);
      toast.error(error.response?.data?.error || 'Assessment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mental Health Assessment</h1>
              <p className="text-muted-foreground">AI-powered mental health screening</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl">
              {QUESTIONS[currentQuestion]}
            </CardTitle>
            <CardDescription>
              Select the option that best describes your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup 
              value={answers[currentQuestion]?.toString() || "0"} 
              onValueChange={(v) => handleAnswer(parseInt(v))}
            >
              <div className="space-y-3">
                {ANSWER_OPTIONS.map((option) => (
                  <div 
                    key={option.value}
                    className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-smooth cursor-pointer"
                  >
                    <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                    <Label 
                      htmlFor={`option-${option.value}`} 
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0 || loading}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!isAnswered || loading}
                className="flex-1 gradient-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentQuestion === QUESTIONS.length - 1 ? (
                  <>
                    Submit Assessment
                    <Brain className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-center text-muted-foreground pt-2">
              Your responses are confidential and will be used to provide personalized recommendations
            </p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <p className="text-sm text-center">
              <strong>Note:</strong> This assessment is not a diagnosis. It's a screening tool to help identify potential mental health concerns. 
              Please consult with a qualified mental health professional for proper evaluation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
