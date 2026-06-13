import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Badge } from '@/components/ui/badge';
import NavigationHeader from '@/components/NavigationHeader';
import { Star, Calendar, Clock, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Feedback {
  id: number;
  rating: number;
  feedback_text: string;
  created_at: string;
  patient_name: string;
  appointment_date: string;
}

interface Therapist {
  id: number;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  specialization: string;
  bio: string;
  price: number;
  rating: number;
  languages: string;
  is_verified: boolean;
  feedbacks?: Feedback[];
  total_reviews?: number;
}

export default function TherapistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    if (id) {
      fetchTherapist();
    }
  }, [id]);

  const fetchTherapist = async () => {
    setLoading(true);
    try {
      // Fetch specific therapist by ID
      const data = await get(`/users/therapists/${id}/`);
      setTherapist(data);
    } catch (error: any) {
      console.error('Error fetching therapist:', error);
      if (error?.response?.status === 404) {
        toast.error('Therapist not found');
      } else {
        toast.error('Failed to load therapist details');
      }
      // Redirect back to therapists list after a delay
      setTimeout(() => navigate('/therapists'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Therapist not found</p>
      </div>
    );
  }

  const name = therapist.user?.full_name || therapist.user?.email || 'Therapist';
  const languagesList = therapist.languages ? therapist.languages.split(',').map(l => l.trim()) : [];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              <ProfileAvatar 
                user={{
                  ...therapist.user,
                  avatar: therapist.avatar
                }} 
                size="xl" 
                className="h-32 w-32"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-3xl mb-2">{name}</CardTitle>
                    <p className="text-muted-foreground">{therapist.specialization || 'General Therapy'}</p>
                  </div>
                  {therapist.is_verified && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      <Award className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{therapist.rating || 'N/A'}</span>
                    {therapist.total_reviews && (
                      <span className="text-sm text-muted-foreground">
                        ({therapist.total_reviews} review{therapist.total_reviews !== 1 ? 's' : ''})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">5+ years experience</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {languagesList.length > 0 ? (
                  languagesList.map((lang, idx) => (
                    <Badge key={idx} variant="outline">
                      {lang}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">English</Badge>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">
                {therapist.bio || 'Experienced mental health professional dedicated to helping clients achieve emotional wellness and personal growth.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Education & Credentials</h3>
              <p className="text-muted-foreground">
                Licensed Clinical Psychologist | MA in Clinical Psychology
              </p>
            </div>

            {/* Patient Reviews Section */}
            {therapist.feedbacks && therapist.feedbacks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Patient Reviews</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{therapist.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({therapist.total_reviews} review{therapist.total_reviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {therapist.feedbacks.slice(0, 5).map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= feedback.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-sm">{feedback.patient_name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{feedback.feedback_text}</p>
                    </div>
                  ))}
                  
                  {therapist.feedbacks.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Showing 5 of {therapist.total_reviews} reviews
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <div>
                <p className="text-2xl font-bold text-primary">
                  ETB {therapist.price || '1,500'}
                  <span className="text-sm text-muted-foreground font-normal">/session</span>
                </p>
              </div>
              <Button 
                onClick={() => navigate(`/therapists/${therapist.id}/book`)}
                className="gradient-primary"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
