import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import NavigationHeader from '@/components/NavigationHeader';
import { Star, Send, Heart, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExistingTestimonial {
  id: number;
  title: string;
  content: string;
  rating: number;
  display_name: string;
  location: string;
  status: string;
  created_at: string;
}

export default function TestimonialForm() {
  const api = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 0,
    display_name: '',
    location: ''
  });
  
  const [existingTestimonial, setExistingTestimonial] = useState<ExistingTestimonial | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    checkExistingTestimonial();
  }, []);

  const checkExistingTestimonial = async () => {
    try {
      setLoading(true);
      const data = await api.get('/testimonials/my-testimonials/');
      const testimonials = data.results || data;
      
      if (testimonials.length > 0) {
        const testimonial = testimonials[0];
        setExistingTestimonial(testimonial);
        
        // If testimonial is pending, allow editing
        if (testimonial.status === 'pending') {
          setFormData({
            title: testimonial.title,
            content: testimonial.content,
            rating: testimonial.rating,
            display_name: testimonial.display_name || '',
            location: testimonial.location || ''
          });
        }
      }
    } catch (error) {
      console.error('Failed to check existing testimonial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (formData.content.length < 50) {
      toast.error('Please write at least 50 characters for your testimonial');
      return;
    }

    try {
      setSubmitting(true);
      
      if (existingTestimonial && existingTestimonial.status === 'pending') {
        // Update existing pending testimonial
        await api.put(`/testimonials/update/${existingTestimonial.id}/`, formData);
        toast.success('Your testimonial has been updated and is pending review');
      } else {
        // Create new testimonial
        await api.post('/testimonials/create/', formData);
        toast.success('Thank you! Your testimonial has been submitted for review');
      }
      
      setSubmitted(true);
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 3000);
      
    } catch (error: any) {
      console.error('Failed to submit testimonial:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to submit testimonial. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            className={`p-1 transition-colors ${
              star <= formData.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star className={`w-8 h-8 ${star <= formData.rating ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <NavigationHeader title="Share Your Experience" />
        <div className="max-w-2xl mx-auto p-8">
          <Card className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <NavigationHeader title="Thank You!" />
        <div className="max-w-2xl mx-auto p-8">
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-xl text-gray-600 mb-6">
              Your testimonial has been submitted and is pending review. We appreciate you taking the time to share your experience.
            </p>
            <p className="text-gray-500 mb-6">
              Redirecting to dashboard in a few seconds...
            </p>
            <Button onClick={() => navigate('/patient/dashboard')}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Show existing testimonial status if not editable
  if (existingTestimonial && existingTestimonial.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <NavigationHeader title="Your Testimonial" />
        <div className="max-w-2xl mx-auto p-8">
          <Card className="p-8">
            <div className="text-center mb-6">
              <Heart className="w-16 h-16 text-pink-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Testimonial</h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(existingTestimonial.status)}`}>
                {existingTestimonial.status.charAt(0).toUpperCase() + existingTestimonial.status.slice(1)}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{existingTestimonial.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= existingTestimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600">({existingTestimonial.rating}/5)</span>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">"{existingTestimonial.content}"</p>
              
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600">
                  <div>Display Name: {existingTestimonial.display_name || 'Anonymous'}</div>
                  {existingTestimonial.location && (
                    <div>Location: {existingTestimonial.location}</div>
                  )}
                  <div>Submitted: {new Date(existingTestimonial.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              {existingTestimonial.status === 'approved' && (
                <p className="text-green-600 mb-4">
                  ✅ Your testimonial has been approved and is now visible to other users!
                </p>
              )}
              {existingTestimonial.status === 'rejected' && (
                <p className="text-red-600 mb-4">
                  ❌ Your testimonial was not approved. You can contact support for more information.
                </p>
              )}
              <Button onClick={() => navigate('/patient/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <NavigationHeader 
        title={existingTestimonial ? "Edit Your Testimonial" : "Share Your Experience"} 
        subtitle="Help others by sharing your mental health journey"
      />
      
      <div className="max-w-2xl mx-auto p-8">
        <Card className="p-8">
          <div className="text-center mb-8">
            <Heart className="w-16 h-16 text-pink-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {existingTestimonial ? 'Edit Your Testimonial' : 'Share Your Story'}
            </h2>
            <p className="text-gray-600">
              Your experience can inspire and help others on their mental health journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate your overall experience? *
              </label>
              {renderStars()}
              {formData.rating > 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  {formData.rating === 5 && "Excellent! 🌟"}
                  {formData.rating === 4 && "Very Good! 👍"}
                  {formData.rating === 3 && "Good 👌"}
                  {formData.rating === 2 && "Fair 😐"}
                  {formData.rating === 1 && "Needs Improvement 😔"}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title for your testimonial *
              </label>
              <input
                type="text"
                required
                minLength={10}
                maxLength={200}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., 'Life-changing therapy experience'"
                className="input-modern"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/200 characters (minimum 10)
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your testimonial *
              </label>
              <textarea
                required
                minLength={50}
                maxLength={1000}
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your experience, what helped you, and how our services made a difference in your life..."
                className="input-modern resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length}/1000 characters (minimum 50)
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display name (optional)
              </label>
              <input
                type="text"
                maxLength={100}
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Leave blank to show as 'Anonymous'"
                className="input-modern"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is how your name will appear publicly. Leave blank for "Anonymous"
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (optional)
              </label>
              <input
                type="text"
                maxLength={100}
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Addis Ababa, Ethiopia"
                className="input-modern"
              />
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Privacy & Review Process</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your testimonial will be reviewed by our team before being published</li>
                <li>• Only approved testimonials will be visible to other users</li>
                <li>• You can edit your testimonial while it's pending review</li>
                <li>• Your personal information will never be shared without permission</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting || formData.rating === 0}
              className="w-full btn-primary text-lg py-6"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {existingTestimonial ? 'Updating...' : 'Submitting...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  {existingTestimonial ? 'Update Testimonial' : 'Submit Testimonial'}
                </div>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}