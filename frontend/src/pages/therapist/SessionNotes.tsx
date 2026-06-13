import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface SessionData {
  appointment_id: number;
  notes: string;
  patient: {
    id: number;
    name: string;
  };
  date: string;
}

export default function SessionNotes() {
  const { appointmentId } = useParams();
  const [notes, setNotes] = useState('');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { get, post } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, [appointmentId]);

  const fetchNotes = async () => {
    try {
      const data = await get(`/appointments/${appointmentId}/notes/`);
      setSessionData(data);
      setNotes(data.notes || '');
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load session notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await post(`/appointments/${appointmentId}/notes/`, { notes });
      toast.success('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
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
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Session Notes</CardTitle>
            {sessionData && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Patient: {sessionData.patient.name}</p>
                <p>Date: {new Date(sessionData.date).toLocaleString()}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Clinical Notes
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document session observations, treatment progress, and recommendations..."
                className="min-h-[400px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                These notes are confidential and only visible to you.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
