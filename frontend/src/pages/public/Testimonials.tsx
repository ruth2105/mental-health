import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import { Star, Quote, Users, TrendingUp, Filter } from 'lucide-react';

interface Testimonial {
  id: number;
  title: string;
  content: string;
  rating: number;
  display_name: string;
  location: string;
  star_display: string;
  created_at: string;
}

interface TestimonialStats {
  total_count: number;
  average_rating: number;
  rating_breakdown: Record<string, number>;
}

export default function Testimonials() {
  const api = useApi();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<TestimonialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    fetchTestimonials();
    fetchStats();
  }, [ratingFilter, featuredOnly]);

  const fetchTestimonials = async () => {
    try {
      const params = new URLSearchParams();
      if (ratingFilter) params.append('rating', ratingFilter.toString());
      if (featuredOnly) params.append('featured', 'true');
      
      const data = await api.get(`/testimonials/public/?${params.toString()}`);
      setTestimonials(data.results || data);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.get('/testimonials/public/stats/');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch testimonial stats:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Patients Say
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories from real people who have found healing and hope through our mental health services.
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.total_count}</div>
              <div className="text-gray-600">Happy Patients</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.average_rating}</div>
              <div className="text-gray-600">Average Rating</div>
              <div className="flex justify-center mt-2">
                {renderStars(Math.round(stats.average_rating))}
              </div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {Math.round((stats.rating_breakdown['5'] / stats.total_count) * 100)}%
              </div>
              <div className="text-gray-600">5-Star Reviews</div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          
          <Button
            variant={featuredOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setFeaturedOnly(!featuredOnly)}
          >
            Featured Only
          </Button>
          
          <div className="flex gap-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={ratingFilter === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                className="flex items-center gap-1"
              >
                <Star className="w-3 h-3" />
                {rating}
              </Button>
            ))}
          </div>
          
          {(ratingFilter || featuredOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRatingFilter(null);
                setFeaturedOnly(false);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 hover-lift">
                <div className="flex items-start gap-4 mb-4">
                  <Quote className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">{testimonial.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(testimonial.rating)}
                      <span className="text-sm text-gray-600">({testimonial.rating}/5)</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.display_name}
                      </div>
                      {testimonial.location && (
                        <div className="text-sm text-gray-600">{testimonial.location}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(testimonial.created_at)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No testimonials found</h3>
            <p className="text-gray-600">
              {ratingFilter || featuredOnly 
                ? 'Try adjusting your filters to see more testimonials.'
                : 'Be the first to share your experience with our mental health services.'
              }
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-6 text-indigo-100">
              Join thousands of others who have found healing and hope through our services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Get Started Today
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}