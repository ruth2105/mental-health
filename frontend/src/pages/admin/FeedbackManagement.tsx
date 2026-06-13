import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FeedbackStats {
  total_feedback: number;
  average_rating: number;
  rating_distribution: Record<string, number>;
  recent_feedback_count: number;
  low_rating_count: number;
  high_rating_count: number;
  satisfaction_rate: number;
  therapist_performance: Array<{
    appointment__therapist__id: number;
    appointment__therapist__full_name: string;
    appointment__therapist__email: string;
    avg_rating: number;
    feedback_count: number;
  }>;
  recent_low_ratings: Array<{
    id: number;
    rating: number;
    feedback_text: string;
    created_at: string;
    patient_name: string;
    therapist_name: string;
  }>;
}

interface Feedback {
  id: number;
  rating: number;
  feedback_text: string;
  created_at: string;
  patient: {
    id: number;
    name: string;
    email: string;
  };
  therapist: {
    id: number;
    name: string;
    email: string;
  };
  appointment: {
    id: number;
    scheduled_time: string;
    status: string;
  };
}

interface FeedbackDetail extends Feedback {
  patient: Feedback['patient'] & {
    total_appointments: number;
    total_feedback: number;
  };
  therapist: Feedback['therapist'] & {
    avg_rating: number;
    total_feedback: number;
  };
  appointment: Feedback['appointment'] & {
    session_notes: string;
  };
}

interface FeedbackListResponse {
  feedbacks: Feedback[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export default function FeedbackManagement() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [therapistFilter, setTherapistFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  
  const { get, delete: deleteRequest } = useApi();

  useEffect(() => {
    loadStats();
    loadFeedbacks();
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [searchQuery, ratingFilter, therapistFilter, dateFrom, dateTo, currentPage]);

  const loadStats = async () => {
    try {
      const data = await get('/appointments/admin/feedback/stats/');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load feedback statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbacks = async () => {
    setFeedbackLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '10',
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);
      if (therapistFilter !== 'all') params.append('therapist', therapistFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const data: FeedbackListResponse = await get(`/appointments/admin/feedback/?${params}`);
      setFeedbacks(data.feedbacks);
      setTotalFeedbacks(data.total);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      toast.error('Failed to load feedback data');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const loadFeedbackDetail = async (feedbackId: number) => {
    setDetailLoading(true);
    try {
      const data = await get(`/appointments/admin/feedback/${feedbackId}/`);
      setSelectedFeedback(data.feedback);
    } catch (error) {
      toast.error('Failed to load feedback details');
    } finally {
      setDetailLoading(false);
    }
  };

  const deleteFeedback = async (feedbackId: number, reason: string) => {
    try {
      await deleteRequest(`/appointments/admin/feedback/${feedbackId}/delete/`, {
        reason
      });
      toast.success('Feedback deleted successfully');
      loadFeedbacks();
      loadStats();
      setSelectedFeedback(null);
    } catch (error) {
      toast.error('Failed to delete feedback');
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-50 border-green-200';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRatingFilter('all');
    setTherapistFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_feedback || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recent_feedback_count || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.average_rating || 0}</div>
            <div className="flex items-center mt-1">
              {getRatingStars(Math.round(stats?.average_rating || 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.satisfaction_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              4+ star ratings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Ratings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.low_rating_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats?.rating_distribution?.[rating.toString()] || 0;
              const percentage = stats?.total_feedback ? (count / stats.total_feedback) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Low Ratings Alert */}
      {stats?.recent_low_ratings && stats.recent_low_ratings.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recent Low Ratings - Immediate Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_low_ratings.map((feedback) => (
                <div key={feedback.id} className="bg-white p-3 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{getRatingStars(feedback.rating)}</div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{feedback.feedback_text}</p>
                      <div className="text-xs text-muted-foreground">
                        Patient: {feedback.patient_name} • Therapist: {feedback.therapist_name}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadFeedbackDetail(feedback.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />

            <Button variant="outline" onClick={clearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {feedbackLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No feedback found matching your criteria
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex">{getRatingStars(feedback.rating)}</div>
                        <Badge className={getRatingColor(feedback.rating)}>
                          {feedback.rating} Star{feedback.rating !== 1 ? 's' : ''}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm mb-3 line-clamp-2">{feedback.feedback_text}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Patient: {feedback.patient.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Therapist: {feedback.therapist.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(feedback.appointment.scheduled_time).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => loadFeedbackDetail(feedback.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Feedback Details</DialogTitle>
                            <DialogDescription>
                              Detailed view of feedback and related information
                            </DialogDescription>
                          </DialogHeader>
                          
                          {detailLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          ) : selectedFeedback && (
                            <div className="space-y-6">
                              {/* Feedback Content */}
                              <div>
                                <h4 className="font-semibold mb-2">Feedback</h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">{getRatingStars(selectedFeedback.rating)}</div>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(selectedFeedback.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm bg-gray-50 p-3 rounded-lg">
                                  {selectedFeedback.feedback_text}
                                </p>
                              </div>

                              {/* Patient Info */}
                              <div>
                                <h4 className="font-semibold mb-2">Patient Information</h4>
                                <div className="bg-blue-50 p-3 rounded-lg space-y-1 text-sm">
                                  <p><strong>Name:</strong> {selectedFeedback.patient.name}</p>
                                  <p><strong>Email:</strong> {selectedFeedback.patient.email}</p>
                                  <p><strong>Total Appointments:</strong> {selectedFeedback.patient.total_appointments}</p>
                                  <p><strong>Total Feedback Given:</strong> {selectedFeedback.patient.total_feedback}</p>
                                </div>
                              </div>

                              {/* Therapist Info */}
                              <div>
                                <h4 className="font-semibold mb-2">Therapist Information</h4>
                                <div className="bg-green-50 p-3 rounded-lg space-y-1 text-sm">
                                  <p><strong>Name:</strong> {selectedFeedback.therapist.name}</p>
                                  <p><strong>Email:</strong> {selectedFeedback.therapist.email}</p>
                                  <p><strong>Average Rating:</strong> {selectedFeedback.therapist.avg_rating.toFixed(2)}</p>
                                  <p><strong>Total Feedback Received:</strong> {selectedFeedback.therapist.total_feedback}</p>
                                </div>
                              </div>

                              {/* Appointment Info */}
                              <div>
                                <h4 className="font-semibold mb-2">Appointment Details</h4>
                                <div className="bg-purple-50 p-3 rounded-lg space-y-1 text-sm">
                                  <p><strong>Date:</strong> {new Date(selectedFeedback.appointment.scheduled_time).toLocaleString()}</p>
                                  <p><strong>Status:</strong> {selectedFeedback.appointment.status}</p>
                                  {selectedFeedback.appointment.session_notes && (
                                    <div>
                                      <strong>Session Notes:</strong>
                                      <p className="mt-1 bg-white p-2 rounded border">
                                        {selectedFeedback.appointment.session_notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Delete Action */}
                              <div className="pt-4 border-t">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Feedback
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this feedback? This action cannot be undone.
                                        Please provide a reason for deletion.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="my-4">
                                      <Input
                                        placeholder="Reason for deletion..."
                                        id="deletion-reason"
                                      />
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          const reason = (document.getElementById('deletion-reason') as HTMLInputElement)?.value || 'No reason provided';
                                          deleteFeedback(selectedFeedback.id, reason);
                                        }}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {feedback.rating <= 2 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Low Rating Feedback</AlertDialogTitle>
                              <AlertDialogDescription>
                                This feedback has a low rating. Are you sure you want to delete it?
                                Please provide a reason for deletion.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="my-4">
                              <Input
                                placeholder="Reason for deletion..."
                                id={`deletion-reason-${feedback.id}`}
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  const reason = (document.getElementById(`deletion-reason-${feedback.id}`) as HTMLInputElement)?.value || 'Low rating feedback';
                                  deleteFeedback(feedback.id, reason);
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalFeedbacks)} of {totalFeedbacks} feedback entries
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}