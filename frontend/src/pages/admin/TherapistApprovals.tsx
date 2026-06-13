import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User, Mail, Award, BookOpen, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';

interface PendingTherapist {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  specialization: string;
  bio: string;
  license_number: string;
  years_of_experience: number;
  education: string;
  price: string;
  languages: string;
  applied_at: string;
  approval_status: string;
}

export default function TherapistApprovals() {
  const [pendingTherapists, setPendingTherapists] = useState<PendingTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
  const { get, post } = useApi();

  useEffect(() => {
    fetchPendingTherapists();
  }, []);

  const fetchPendingTherapists = async () => {
    try {
      setLoading(true);
      const data = await get('/users/admin/therapists/pending/');
      setPendingTherapists(data);
    } catch (error) {
      toast.error('Failed to load pending therapists');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profileId: number, email: string) => {
    try {
      setActionLoading(profileId);
      await post(`/users/admin/therapists/${profileId}/approve/`, {});
      toast.success(`✅ Approved ${email}`);
      fetchPendingTherapists();
    } catch (error) {
      toast.error('Failed to approve therapist');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (profileId: number, email: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(profileId);
      await post(`/users/admin/therapists/${profileId}/reject/`, {
        reason: rejectionReason
      });
      toast.success(`Rejected ${email}`);
      setShowRejectModal(null);
      setRejectionReason('');
      fetchPendingTherapists();
    } catch (error) {
      toast.error('Failed to reject therapist');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Therapist Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve therapist applications</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Clock className="w-4 h-4 mr-2" />
          {pendingTherapists.length} Pending
        </Badge>
      </div>

      {pendingTherapists.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No pending therapist applications at the moment.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingTherapists.map((therapist) => (
            <Card key={therapist.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {therapist.full_name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{therapist.full_name}</h3>
                      <div className="flex items-center space-x-2 text-gray-600 mt-1">
                        <Mail className="w-4 h-4" />
                        <span>{therapist.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>Applied {new Date(therapist.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800">
                    Pending Review
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Award className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Specialization</p>
                        <p className="text-gray-900">{therapist.specialization}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">License Number</p>
                        <p className="text-gray-900">{therapist.license_number || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <BookOpen className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Experience</p>
                        <p className="text-gray-900">{therapist.years_of_experience || 0} years</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg font-semibold text-indigo-600 mt-0.5">ETB</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Session Price</p>
                        <p className="text-gray-900">ETB {therapist.price}/session</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Languages className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Languages</p>
                        <p className="text-gray-900">{therapist.languages || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Award className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Education</p>
                        <p className="text-gray-900">{therapist.education || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {therapist.bio && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Bio</p>
                    <p className="text-gray-600 text-sm">{therapist.bio}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(therapist.id, therapist.email)}
                    disabled={actionLoading === therapist.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(therapist.id)}
                    disabled={actionLoading === therapist.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>

                {/* Reject Modal */}
                {showRejectModal === therapist.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full p-6 space-y-4">
                      <h3 className="text-xl font-bold text-gray-900">Reject Application</h3>
                      <p className="text-gray-600">Please provide a reason for rejection:</p>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        rows={4}
                        placeholder="e.g., License verification failed, incomplete information..."
                      />
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => {
                            setShowRejectModal(null);
                            setRejectionReason('');
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleReject(therapist.id, therapist.email)}
                          disabled={!rejectionReason.trim() || actionLoading === therapist.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          Confirm Rejection
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
