import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const { apiCall, loading } = useApi();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      await apiCall('/api/therapy/feedback/', {
        method: 'POST',
        body: {
          rating,
          feedback,
        },
      });
      toast.success('Thank you for your feedback!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-soft">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Session Completed</CardTitle>
            <CardDescription>
              Help us improve by sharing your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Doctor's Notes</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Progress noted in managing anxiety symptoms. Continue practicing the breathing 
                exercises discussed. Recommend weekly sessions for the next month to maintain 
                momentum. Remember to use the coping strategies we discussed when feeling overwhelmed.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Rate Your Session</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-smooth hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts about the session..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
              />
            </div>

            <Button 
              className="w-full gradient-primary" 
              onClick={handleSubmit}
              disabled={loading || rating === 0}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
