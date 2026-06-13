import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: number;
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
  scheduled_time: string;
  status: string;
  paid: boolean;
  session_notes?: string;
}

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { get, del, post } = useApi();

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const data = await get(`/users/admin/appointments/?${params.toString()}`);
      setAppointments(data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsDialog(true);
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await post(`/appointments/${appointmentId}/cancel/`, {});
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) return;
    
    try {
      await del(`/appointments/${appointmentId}/`);
      toast.success('Appointment deleted');
      loadAppointments();
    } catch (error) {
      toast.error('Failed to delete appointment');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      Scheduled: 'default',
      Completed: 'outline',
      Cancelled: 'destructive',
      'No Show': 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Appointments Management</CardTitle>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Therapist</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">#{apt.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{apt.patient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {apt.patient.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{apt.therapist.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {apt.therapist.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(apt.scheduled_time).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>
                      <TableCell>
                        <Badge variant={apt.paid ? 'default' : 'secondary'}>
                          {apt.paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(apt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {apt.status === 'Scheduled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelAppointment(apt.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteAppointment(apt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Appointment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View detailed information about this appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Patient Information</h4>
                  <p className="text-sm"><strong>Name:</strong> {selectedAppointment.patient.name}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedAppointment.patient.email}</p>
                  <p className="text-sm"><strong>ID:</strong> #{selectedAppointment.patient.id}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Therapist Information</h4>
                  <p className="text-sm"><strong>Name:</strong> {selectedAppointment.therapist.name}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedAppointment.therapist.email}</p>
                  <p className="text-sm"><strong>ID:</strong> #{selectedAppointment.therapist.id}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Appointment Details</h4>
                <p className="text-sm"><strong>Appointment ID:</strong> #{selectedAppointment.id}</p>
                <p className="text-sm"><strong>Scheduled Time:</strong> {new Date(selectedAppointment.scheduled_time).toLocaleString()}</p>
                <p className="text-sm"><strong>Status:</strong> {getStatusBadge(selectedAppointment.status)}</p>
                <p className="text-sm"><strong>Payment Status:</strong> {' '}
                  <Badge variant={selectedAppointment.paid ? 'default' : 'secondary'}>
                    {selectedAppointment.paid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </p>
              </div>
              
              {selectedAppointment.session_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Session Notes</h4>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {selectedAppointment.session_notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
