import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import NavigationHeader from '@/components/NavigationHeader';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackForm() {
  const { appointmentId } = useParams();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [checkingFeedback, setCheckingFeedback] = useState(true);
  const { post, get } = useApi();
  const navigate = useNavigate();
  const { goTo, goToAppointmentFlow } = useNavigationFlow();

  // Check if feedback already exists
  useEffect(() => {
    checkExistingFeedback();
  }, [appointmentId]);

  const checkExistingFeedback = async () => {
    try {
      const response = await get(`/appointments/feedback/list/?appointment_id=${appointmentId}`);
      if (response) {
        setExistingFeedback(response);
      }
    } catch (error) {
      // No existing feedback, which is fine
      console.log('No existing feedback found');
    } finally {
      setCheckingFeedback(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!feedbackText.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    setLoading(true);
    try {
      await post('/appointments/feedback/', {
        appointment: parseInt(appointmentId!),
        rating,
        feedback_text: feedbackText
      });

      toast.success('Thank you for your feedback!');
      navigate('/patient/dashboard');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      
      // Handle specific error messages
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.appointment && errorData.appointment[0]) {
          toast.error('You have already submitted feedback for this appointment');
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else if (errorData.non_field_errors) {
          toast.error(errorData.non_field_errors[0]);
        } else {
          toast.error('Failed to submit feedback. Please try again.');
        }
      } else {
        toast.error('Failed to submit feedback. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingFeedback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (existingFeedback) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Your Feedback</CardTitle>
              <p className="text-muted-foreground">
                You have already submitted feedback for this session.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Your Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= existingFeedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{existingFeedback.rating}/5</span>
                </div>
                <div>
                  <span className="font-medium">Your Feedback:</span>
                  <p className="mt-1 text-gray-700">{existingFeedback.feedback_text}</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Submitted on {new Date(existingFeedback.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/patient/dashboard')}
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => goTo('/appointments')}
                  variant="outline"
                  className="flex-1"
                >
                  View Appointments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="Session Feedback"
        subtitle="How was your therapy session? Your feedback helps us improve."
        showBreadcrumbs={true}
      />
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <Card className="shadow-soft">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              {/* Feedback Text */}
              <div className="space-y-2">
                <label htmlFor="feedback" className="text-sm font-medium">
                  Your Feedback
                </label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us about your experience..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[150px]"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/patient/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
