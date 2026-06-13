import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, UserCheck, Calendar, Activity, Shield, ArrowRight, Plus, Trash2, CheckCircle2, Crown, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import UsersManagement from './UsersManagement';
import AppointmentsManagement from './AppointmentsManagement';
import PaymentManagement from './PaymentManagement';
import AdminManagement from './AdminManagement';
import FeedbackManagement from './FeedbackManagement';
import TestimonialManagement from './TestimonialManagement';

interface DashboardStats {
  users: {
    total: number;
    patients: number;
    therapists: number;
    admins: number;
    recent: number;
  };
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const { get } = useApi();
  const navigate = useNavigate();
  
  // Get current user from localStorage to check if super admin
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };
  
  const currentUser = getCurrentUser();
  const isSuperAdmin = currentUser?.is_superuser || false;
  


  useEffect(() => {
    loadStats();
    loadPendingTherapists();
    loadTasks();
  }, []);

  const loadStats = async () => {
    try {
      const data = await get('/users/admin/stats/');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingTherapists = async () => {
    try {
      const data = await get('/users/admin/therapists/pending/');
      setPendingCount(data.length);
    } catch (error) {
      console.error('Failed to load pending therapists count');
    }
  };

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('adminTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('adminTasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: newTaskPriority,
      createdAt: new Date().toISOString(),
    };

    saveTasks([...tasks, newTask]);
    setNewTaskTitle('');
    toast.success('Task added');
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    toast.success('Task deleted');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, therapists, and appointments</p>
          </div>
          <Button 
            onClick={() => navigate('/admin/therapists/approvals')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Therapist Approvals
            {pendingCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.users.recent || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Patients</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.users.patients || 0}</div>
              <p className="text-xs text-muted-foreground">Active patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Therapists</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.users.therapists || 0}</div>
              <p className="text-xs text-muted-foreground">Registered therapists</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.appointments.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.appointments.pending || 0} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {pendingCount > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900">
                        {pendingCount} Therapist{pendingCount > 1 ? 's' : ''} Awaiting Approval
                      </h3>
                      <p className="text-sm text-amber-700">
                        Review and approve therapist applications to maintain quality
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/admin/therapists/approvals')}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Review Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(isSuperAdmin || currentUser?.email === 'admin@test.com') && (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900">
                        Super Admin Controls
                      </h3>
                      <p className="text-sm text-purple-700">
                        Manage administrator accounts and system-wide settings
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate('/admin/manage-admins')}
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Manage Admins
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Admin Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Admin Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Task Form */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="flex-1"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="px-3 py-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <Button onClick={addTask}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No tasks yet. Add your first task above!
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg ${
                      task.completed ? 'bg-gray-50 opacity-60' : 'bg-white'
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className="flex-1">
                      <p className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Task Summary */}
            {tasks.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {tasks.filter(t => t.completed).length} of {tasks.length} completed
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const completedTasks = tasks.filter(t => t.completed);
                    if (completedTasks.length > 0) {
                      saveTasks(tasks.filter(t => !t.completed));
                      toast.success('Completed tasks cleared');
                    }
                  }}
                >
                  Clear Completed
                </Button>
              </div>
            )}
          </CardContent>
        </Card>



        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className={(isSuperAdmin || currentUser?.email === 'admin@test.com') ? "grid w-full grid-cols-6" : "grid w-full grid-cols-5"}>
            <TabsTrigger value="users">Users Management</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            {(isSuperAdmin || currentUser?.email === 'admin@test.com') && (
              <TabsTrigger value="admins" className="bg-gradient-to-r from-purple-50 to-indigo-50 data-[state=active]:from-purple-100 data-[state=active]:to-indigo-100">
                <Crown className="h-4 w-4 mr-2" />
                Admin Management
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackManagement />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialManagement />
          </TabsContent>

          {(isSuperAdmin || currentUser?.email === 'admin@test.com') && (
            <TabsContent value="admins">
              <AdminManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
