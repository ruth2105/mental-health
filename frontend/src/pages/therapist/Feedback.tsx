import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, User, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TherapistFeedback() {
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const data = await get(`/feedback/?therapist_id=${user?.id}`);
      setFeedbackData(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Patient Feedback</h1>
          <p className="text-muted-foreground">Reviews and ratings from your patients</p>
        </div>

        {/* Summary Card */}
        <Card className="mb-8 shadow-soft">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {feedbackData?.average_rating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(feedbackData?.average_rating || 0))}
                </div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {feedbackData?.total_reviews || 0}
                </div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {feedbackData?.feedbacks?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Recent Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          {!feedbackData?.feedbacks || feedbackData.feedbacks.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No feedback yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete sessions to receive patient feedback
                </p>
              </CardContent>
            </Card>
          ) : (
            feedbackData.feedbacks.map((feedback: any) => (
              <Card key={feedback.id} className="shadow-soft hover:shadow-hover transition-smooth">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feedback.patient_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(feedback.appointment_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {renderStars(feedback.rating)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feedback.feedback_text}</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Submitted on {new Date(feedback.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
