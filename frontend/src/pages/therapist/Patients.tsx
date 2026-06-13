import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  id: number;
  name: string;
  email: string;
  total_sessions: number;
  last_session?: string;
  status: string;
  avatar?: string;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    console.log('🔍 Fetching appointments to extract patients');
    try {
      // Fetch appointments instead of using the broken patients endpoint
      const data = await get('/appointments/');
      console.log('✅ Appointments API Response:', data);
      
      // Extract appointments array (handle pagination)
      const appointments = data?.results || data || [];
      console.log('   Appointments count:', appointments.length);
      
      if (!Array.isArray(appointments)) {
        console.error('❌ Appointments is not an array:', appointments);
        setPatients([]);
        return;
      }
      
      // Extract unique patients from appointments
      const patientMap = new Map<number, Patient>();
      
      appointments.forEach((apt: any) => {
        const patientId = apt.patient?.id || apt.patient_id;
        const patientEmail = apt.patient?.email || apt.patient_email;
        const patientName = apt.patient?.full_name || apt.patient_name || patientEmail?.split('@')[0];
        
        if (!patientId) {
          console.warn('⚠️ Appointment missing patient ID:', apt);
          return;
        }
        
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            name: patientName || 'Patient',
            email: patientEmail || 'Unknown',
            total_sessions: 0,
            last_session: apt.scheduled_time,
            status: 'Active',
            avatar: apt.patient?.avatar || undefined
          });
        }
        
        // Update session count and last session
        const patient = patientMap.get(patientId)!;
        patient.total_sessions++;
        
        // Update last session if this appointment is more recent
        if (apt.scheduled_time && (!patient.last_session || new Date(apt.scheduled_time) > new Date(patient.last_session))) {
          patient.last_session = apt.scheduled_time;
        }
      });
      
      const patientsList = Array.from(patientMap.values());
      console.log('📋 Extracted patients:', patientsList);
      console.log('   Count:', patientsList.length);
      setPatients(patientsList);
      
      if (patientsList.length === 0) {
        console.warn('⚠️ No patients found in appointments');
      }
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      toast.error('Failed to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
      console.log('✓ Loading complete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Patients</h1>
          <p className="text-muted-foreground">Manage your patient relationships</p>
          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-500">
            Debug: {patients.length} patients loaded | Loading: {loading ? 'Yes' : 'No'}
          </div>
        </div>

        {patients.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No patients yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <Card key={patient.id} className="shadow-soft hover:shadow-hover transition-smooth">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <ProfileAvatar 
                      user={{ 
                        ...patient, 
                        full_name: patient.name,
                        profile_picture: patient.avatar 
                      }} 
                      size="lg" 
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{patient.name || 'Patient'}</CardTitle>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sessions</span>
                    <span className="font-semibold">{patient.total_sessions || 0}</span>
                  </div>
                  {patient.last_session && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Last: {new Date(patient.last_session).toLocaleDateString()}</span>
                    </div>
                  )}
                  <Badge variant="outline" className="mt-2">
                    {patient.status || 'Active'}
                  </Badge>
                  <Button 
                    onClick={() => navigate(`/therapist/patients/${patient.id}`)}
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
