import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { mentalHealthService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SimpleRadioGroup as RadioGroup, SimpleRadioItem as RadioGroupItem } from '@/components/SimpleRadioGroup';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowLeft, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

// Assessment questions with translation keys - Reduced to 19 core questions
const getAssessmentQuestions = (t: (key: string) => string) => [
  { id: 'interest_pleasure', label: t('assessment.q1') },
  { id: 'feeling_down', label: t('assessment.q2') },
  { id: 'sleep_problems', label: t('assessment.q3') },
  { id: 'tired_energy', label: t('assessment.q4') },
  { id: 'appetite_changes', label: t('assessment.q5') },
  { id: 'feeling_bad_self', label: t('assessment.q6') },
  { id: 'trouble_concentration', label: t('assessment.q7') },
  { id: 'feeling_nervous', label: t('assessment.q8') },
  { id: 'stop_worrying', label: t('assessment.q9') },
  { id: 'worrying_much', label: t('assessment.q10') },
  { id: 'trouble_relaxing', label: t('assessment.q11') },
  { id: 'easily_annoyed', label: t('assessment.q12') },
  { id: 'afraid_awful', label: t('assessment.q13') },
  { id: 'thoughts_death', label: t('assessment.q14') },
  { id: 'overwhelmed', label: t('assessment.q15') },
  { id: 'jumpy_startled', label: t('assessment.q16') },
  { id: 'lost_interest', label: t('assessment.q17') },
  { id: 'mood_swings', label: t('assessment.q18') },
  { id: 'daily_stress', label: t('assessment.q19') }
];

export default function Assessment() {
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [symptoms, setSymptoms] = useState<number[]>(Array(19).fill(0));
  const [age, setAge] = useState<number>(25); // Default age
  const [showAgeInput, setShowAgeInput] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get translated questions
  const questions = getAssessmentQuestions(t);
  
  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  const handleAnswer = (value: number) => {
    const newSymptoms = [...symptoms];
    newSymptoms[currentStep] = value;
    setSymptoms(newSymptoms);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await mentalHealthService.predict({
        symptoms: symptoms,
        language: language,
        age: age  // Include age in the request
      });

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
              <h1 className="text-3xl font-bold">{t('assessment.title')}</h1>
              <p className="text-muted-foreground">{t('assessment.subtitle')}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('assessment.question')} {currentStep + 1} {t('assessment.of')} {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Age Input Card (shown before questions) */}
        {showAgeInput && (
          <Card className="shadow-soft mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Before we begin...</CardTitle>
              <CardDescription>Please provide your age for more accurate assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Your Age</Label>
                <input
                  id="age"
                  type="number"
                  min="4"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your age"
                />
                <p className="text-sm text-muted-foreground">Age range: 4-100 years</p>
              </div>
              <Button
                onClick={() => setShowAgeInput(false)}
                className="w-full gradient-primary"
              >
                Continue to Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        {!showAgeInput && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion.label}
            </CardTitle>
            <CardDescription>
              {t('assessment.select_option')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup 
              value={symptoms[currentStep]?.toString() || "0"} 
              onValueChange={(v) => handleAnswer(parseInt(v))}
              className="space-y-3"
            >
              <RadioGroupItem value="0" id="not_at_all">
                <Label htmlFor="not_at_all" className="flex-1 cursor-pointer">{t('assessment.not_at_all')}</Label>
              </RadioGroupItem>
              <RadioGroupItem value="1" id="several_days">
                <Label htmlFor="several_days" className="flex-1 cursor-pointer">{t('assessment.several_days')}</Label>
              </RadioGroupItem>
              <RadioGroupItem value="2" id="more_than_half">
                <Label htmlFor="more_than_half" className="flex-1 cursor-pointer">{t('assessment.more_than_half')}</Label>
              </RadioGroupItem>
              <RadioGroupItem value="3" id="nearly_every_day">
                <Label htmlFor="nearly_every_day" className="flex-1 cursor-pointer">{t('assessment.nearly_every_day')}</Label>
              </RadioGroupItem>
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between gap-4 pt-4">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('assessment.previous')}
              </Button>

              <Button
                onClick={handleNext}
                disabled={loading}
                className="gradient-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.loading')}...
                  </>
                ) : currentStep === questions.length - 1 ? (
                  t('assessment.complete_assessment')
                ) : (
                  <>
                    {t('assessment.next')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Alternative Option */}
        {!showAgeInput && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Want a more conversational experience?
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/chat-assessment')}
            className="text-sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Try Chat Assessment Instead
          </Button>
        </div>
        )}

        {/* Disclaimer */}
        {!showAgeInput && (
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              <strong>Medical Disclaimer:</strong> This assessment is for screening purposes only and does not replace professional medical diagnosis. Please consult with a licensed mental health professional for proper evaluation and treatment.
            </p>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
