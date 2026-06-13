import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import NavigationHeader from '@/components/NavigationHeader';
import { 
  Star, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  Trash2, 
  Users, 
  TrendingUp,
  MessageSquare,
  Award,
  MoreHorizontal,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface Testimonial {
  id: number;
  title: string;
  content: string;
  rating: number;
  display_name: string;
  location: string;
  status: string;
  is_featured: boolean;
  user_name: string;
  user_email: string;
  star_display: string;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  admin_notes: string;
}

interface TestimonialStats {
  total_testimonials: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  average_rating: number;
  featured_count: number;
  rating_breakdown: Record<string, number>;
}

export default function TestimonialManagement() {
  const api = useApi();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<TestimonialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonials, setSelectedTestimonials] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    search: ''
  });
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');

  useEffect(() => {
    fetchTestimonials();
    fetchStats();
  }, [filters]);

  const fetchTestimonials = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.search) params.append('search', filters.search);
      
      const data = await api.get(`/testimonials/admin/?${params.toString()}`);
      setTestimonials(data.results || data);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.get('/testimonials/admin/stats/');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTestimonials.length === 0) {
      toast.error('Please select testimonials first');
      return;
    }

    try {
      if (action === 'delete') {
        await api.delete('/testimonials/admin/bulk-delete/', {
          testimonial_ids: selectedTestimonials
        });
        toast.success(`Deleted ${selectedTestimonials.length} testimonials`);
      } else {
        await api.post('/testimonials/admin/bulk-update/', {
          testimonial_ids: selectedTestimonials,
          action
        });
        toast.success(`Updated ${selectedTestimonials.length} testimonials`);
      }
      
      setSelectedTestimonials([]);
      fetchTestimonials();
      fetchStats();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Action failed. Please try again.');
    }
  };

  const handleUpdateTestimonial = async (id: number, updates: Partial<Testimonial>) => {
    try {
      await api.patch(`/testimonials/admin/${id}/`, updates);
      toast.success('Testimonial updated successfully');
      fetchTestimonials();
      fetchStats();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to update testimonial:', error);
      toast.error('Failed to update testimonial');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <NavigationHeader title="Testimonial Management" subtitle="Review and manage patient testimonials" />
      
      <div className="max-w-7xl mx-auto p-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total_testimonials}</div>
                  <div className="text-sm text-gray-600">Total Testimonials</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.pending_count}</div>
                  <div className="text-sm text-gray-600">Pending Review</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.approved_count}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.average_rating}</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search testimonials..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="input-modern w-64"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input-modern w-40"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              className="input-modern w-40"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            
            <Button
              variant="outline"
              onClick={() => setFilters({ status: '', rating: '', search: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedTestimonials.length > 0 && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedTestimonials.length} testimonial(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkAction('approve')}>
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('reject')}>
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('feature')}>
                  <Award className="w-4 h-4 mr-1" />
                  Feature
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Testimonials List */}
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : testimonials.length > 0 ? (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedTestimonials.includes(testimonial.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTestimonials(prev => [...prev, testimonial.id]);
                      } else {
                        setSelectedTestimonials(prev => prev.filter(id => id !== testimonial.id));
                      }
                    }}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{testimonial.title}</h3>
                        <div className="flex items-center gap-4 mb-2">
                          {renderStars(testimonial.rating)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(testimonial.status)}`}>
                            {testimonial.status}
                          </span>
                          {testimonial.is_featured && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTestimonial(testimonial);
                          setEditingNotes(testimonial.admin_notes || '');
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">"{testimonial.content}"</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">User:</span> {testimonial.user_name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {testimonial.user_email}
                      </div>
                      <div>
                        <span className="font-medium">Display:</span> {testimonial.display_name || 'Anonymous'}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(testimonial.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No testimonials found</h3>
            <p className="text-gray-600">No testimonials match your current filters.</p>
          </Card>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedTestimonial && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Testimonial Details</h2>
                  <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2">{selectedTestimonial.title}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      {renderStars(selectedTestimonial.rating)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTestimonial.status)}`}>
                        {selectedTestimonial.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Content:</h4>
                    <p className="text-gray-700 leading-relaxed">"{selectedTestimonial.content}"</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">User:</span> {selectedTestimonial.user_name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedTestimonial.user_email}
                    </div>
                    <div>
                      <span className="font-medium">Display Name:</span> {selectedTestimonial.display_name || 'Anonymous'}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {selectedTestimonial.location || 'Not specified'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes:
                    </label>
                    <textarea
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      rows={3}
                      className="input-modern resize-none"
                      placeholder="Add internal notes about this testimonial..."
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleUpdateTestimonial(selectedTestimonial.id, { 
                        status: 'approved',
                        admin_notes: editingNotes
                      })}
                      disabled={selectedTestimonial.status === 'approved'}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateTestimonial(selectedTestimonial.id, { 
                        status: 'rejected',
                        admin_notes: editingNotes
                      })}
                      disabled={selectedTestimonial.status === 'rejected'}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateTestimonial(selectedTestimonial.id, { 
                        is_featured: !selectedTestimonial.is_featured,
                        admin_notes: editingNotes
                      })}
                    >
                      <Award className="w-4 h-4 mr-1" />
                      {selectedTestimonial.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateTestimonial(selectedTestimonial.id, { 
                        admin_notes: editingNotes
                      })}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}