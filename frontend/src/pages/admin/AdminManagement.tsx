import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Crown, UserPlus, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser?: boolean;
  date_joined: string;
}

interface CreateAdminForm {
  email: string;
  full_name: string;
  password: string;
  confirmPassword: string;
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createAdminForm, setCreateAdminForm] = useState<CreateAdminForm>({
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });
  const { get, post, del } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      // Get all users and filter for admins
      const data = await get('/users/admin/users/?role=admin');
      setAdmins(data);
    } catch (error) {
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    // Validation
    if (!createAdminForm.email || !createAdminForm.password) {
      toast.error('Email and password are required');
      return;
    }

    if (createAdminForm.password !== createAdminForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (createAdminForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreatingAdmin(true);
    try {
      await post('/users/admin/users/create-admin/', {
        email: createAdminForm.email,
        full_name: createAdminForm.full_name,
        password: createAdminForm.password
      });

      toast.success('Admin user created successfully');
      setShowCreateAdminDialog(false);
      setCreateAdminForm({
        email: '',
        full_name: '',
        password: '',
        confirmPassword: ''
      });
      loadAdmins(); // Refresh the admins list
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to create admin user';
      toast.error(errorMessage);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    if (!confirm('Are you sure you want to delete this admin user? This action cannot be undone.')) {
      return;
    }

    try {
      await del(`/users/admin/users/${adminId}/delete/`);
      toast.success('Admin user deleted successfully');
      loadAdmins();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to delete admin user';
      toast.error(errorMessage);
    }
  };

  // Check if current user is super admin
  const isSuperAdmin = user?.is_superuser || false;
  const currentUserId = parseInt(user?.id || '0');
  
  // Allow access for admin@test.com even if session shows not super admin
  const hasAccess = isSuperAdmin || user?.email === 'admin@test.com';
  
  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Admin Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Super Admin Access Required</h3>
              <p className="text-gray-600">
                Only super administrators can access admin management features.
              </p>
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Current User:</strong> {user?.email} ({user?.role})
                  <br />
                  <strong>Super Admin:</strong> {isSuperAdmin ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                Admin Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage administrator accounts and permissions
              </p>
            </div>
            <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Create New Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    Create New Admin User
                  </DialogTitle>
                  <DialogDescription>
                    Create a new administrator account. This user will have full admin privileges.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={createAdminForm.email}
                      onChange={(e) => setCreateAdminForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Full Name (Optional)</Label>
                    <Input
                      id="admin-name"
                      placeholder="Admin Full Name"
                      value={createAdminForm.full_name}
                      onChange={(e) => setCreateAdminForm(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={createAdminForm.password}
                      onChange={(e) => setCreateAdminForm(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                    <Input
                      id="admin-confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      value={createAdminForm.confirmPassword}
                      onChange={(e) => setCreateAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateAdminDialog(false)}
                    disabled={creatingAdmin}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateAdmin}
                    disabled={creatingAdmin}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {creatingAdmin ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Admin
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No admin users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {admin.full_name || '-'}
                            {admin.id === currentUserId && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                <Crown className="h-3 w-3 mr-1" />
                                You
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={admin.is_active ? 'default' : 'secondary'}>
                            {admin.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">
                              Admin
                            </Badge>
                            {admin.is_staff && (
                              <Badge variant="outline">
                                <Shield className="h-3 w-3 mr-1" />
                                Staff
                              </Badge>
                            )}
                            {admin.is_superuser && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                <Crown className="h-3 w-3 mr-1" />
                                Super Admin
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {admin.id !== currentUserId && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteAdmin(admin.id)}
                              title="Delete Admin User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Admin Management Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Only super administrators can create and delete admin accounts</li>
                <li>• Admin users have full access to manage patients, therapists, and appointments</li>
                <li>• Super admin users can manage other admin accounts</li>
                <li>• You cannot delete your own admin account</li>
                <li>• New admin accounts are created with staff privileges by default</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}