import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Patient {
  id: number;
  name: string;
  email: string;
  total_sessions: number;
  status: string;
  avatar?: string;
}

interface Session {
  id: number;
  date_time: string;
  notes: string;
  status: string;
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // Fetch patient notes which includes session history
      const notesData = await get(`/appointments/patients/${id}/notes/`);
      
      // Create patient object from notes data
      setPatient({
        id: parseInt(id!),
        name: 'Patient', // Will be populated from first note
        email: '',
        total_sessions: notesData.total_sessions || 0,
        status: 'Active'
      });

      // Transform notes to sessions format
      const sessionsList = notesData.notes?.map((note: any) => ({
        id: note.appointment_id,
        date_time: note.date,
        notes: note.notes,
        status: 'Completed'
      })) || [];
      
      setSessions(sessionsList);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient details');
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

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button 
          onClick={() => navigate('/therapist/patients')} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient Info */}
          <Card className="lg:col-span-1 shadow-elegant">
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                <ProfileAvatar 
                  user={{ 
                    ...patient, 
                    full_name: patient.name,
                    profile_picture: patient.avatar 
                  }} 
                  size="xl" 
                  className="mb-4"
                />
                <CardTitle className="text-xl">{patient.name || 'Patient'}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{patient.email}</p>
                <Badge variant="outline" className="mt-3">
                  {patient.status || 'Active'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-3 bg-card/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{patient.total_sessions || 0}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
            </CardContent>
          </Card>

          {/* Session History */}
          <Card className="lg:col-span-2 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Session History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No sessions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-semibold">
                            {format(new Date(session.date_time), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <Badge variant="outline">{session.status}</Badge>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{session.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
