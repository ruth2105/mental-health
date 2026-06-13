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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, CheckCircle, XCircle, Trash2, Shield, UserPlus, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  profile?: {
    specialization?: string;
    rating?: number;
    is_verified?: boolean;
  };
}

interface CreateAdminForm {
  email: string;
  full_name: string;
  password: string;
  confirmPassword: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
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
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (search) params.append('search', search);
      
      const data = await get(`/users/admin/users/?${params.toString()}`);
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await post(`/users/admin/users/${userId}/toggle/`, {});
      toast.success('User status updated');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleVerifyTherapist = async (userId: number) => {
    try {
      await post(`/users/admin/users/${userId}/verify/`, {});
      toast.success('Therapist verification updated');
      loadUsers();
    } catch (error) {
      toast.error('Failed to verify therapist');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await del(`/users/admin/users/${userId}/delete/`);
      toast.success('User deleted');
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleSearch = () => {
    loadUsers();
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
      loadUsers(); // Refresh the users list
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to create admin user';
      toast.error(errorMessage);
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Check if current user is super admin
  const isSuperAdmin = user?.is_superuser || false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Users Management</CardTitle>
          {(isSuperAdmin || user?.email === 'admin@test.com') && (
            <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Create Admin
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
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="patient">Patients</SelectItem>
              <SelectItem value="therapist">Therapists</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
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
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell className="font-medium">{userItem.email}</TableCell>
                      <TableCell>{userItem.full_name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={userItem.role === 'admin' ? 'destructive' : 'default'}>
                            {userItem.role}
                          </Badge>
                          {userItem.role === 'admin' && userItem.id === parseInt(user?.id || '0') && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              <Crown className="h-3 w-3 mr-1" />
                              You
                            </Badge>
                          )}
                          {userItem.role === 'therapist' && userItem.profile?.is_verified && (
                            <Badge variant="outline" className="ml-2">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={userItem.is_active ? 'default' : 'secondary'}>
                          {userItem.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(userItem.date_joined).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(userItem.id)}
                          disabled={userItem.id === parseInt(user?.id || '0')}
                          title={userItem.id === parseInt(user?.id || '0') ? 'Cannot modify your own account' : 'Toggle user status'}
                        >
                          {userItem.is_active ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {userItem.role === 'therapist' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyTherapist(userItem.id)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {/* Only show delete button for non-admin users, or if current user is super admin */}
                        {(userItem.role !== 'admin' || isSuperAdmin) && userItem.id !== parseInt(user?.id || '0') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(userItem.id)}
                            title={userItem.role === 'admin' ? 'Delete Admin User (Super Admin Only)' : 'Delete User'}
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
  );
}
