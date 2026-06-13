import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  User, Mail, Globe, Calendar, HelpCircle, 
  ChevronDown, ChevronUp, Loader2, Shield, Bell,
  Camera, Lock, Trash2, Download, Eye, EyeOff,
  Smartphone, Moon, Sun, Volume2, VolumeX
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Appointment {
  id: number;
  therapist: any;
  scheduled_time: string;
  status: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function PatientSettings() {
  const { user, refreshUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { get, patch } = useApi();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    profile_picture: '',
  });

  const [preferences, setPreferences] = useState({
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: false,
    dark_mode: false,
    sound_enabled: true,
    privacy_mode: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    login_alerts: true,
    session_timeout: '30',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const faqs: FAQ[] = [
    {
      question: t('faq.how_to_book'),
      answer: t('faq.how_to_book_answer')
    },
    {
      question: t('faq.cancel_appointment'),
      answer: t('faq.cancel_appointment_answer')
    },
    {
      question: t('faq.payment_methods'),
      answer: t('faq.payment_methods_answer')
    },
    {
      question: t('faq.session_duration'),
      answer: t('faq.session_duration_answer')
    },
    {
      question: t('faq.privacy_security'),
      answer: t('faq.privacy_security_answer')
    },
    {
      question: t('faq.emergency_help'),
      answer: t('faq.emergency_help_answer')
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileData, appointmentsData, preferencesData] = await Promise.all([
        get('/users/profile/'),
        get('/appointments/'),
        get('/users/preferences/').catch(() => ({})) // Fallback if preferences endpoint doesn't exist
      ]);
      
      // Load profile data with localStorage fallback for profile picture
      const savedProfilePicture = localStorage.getItem('profile_picture');
      setFormData({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        date_of_birth: profileData.date_of_birth || '',
        profile_picture: profileData.profile_picture || savedProfilePicture || '',
      });

      // Load preferences with localStorage fallback
      setPreferences({
        notifications_enabled: preferencesData.notifications_enabled ?? 
          JSON.parse(localStorage.getItem('preference_notifications_enabled') ?? 'true'),
        email_notifications: preferencesData.email_notifications ?? 
          JSON.parse(localStorage.getItem('preference_email_notifications') ?? 'true'),
        sms_notifications: preferencesData.sms_notifications ?? 
          JSON.parse(localStorage.getItem('preference_sms_notifications') ?? 'false'),
        dark_mode: preferencesData.dark_mode ?? 
          JSON.parse(localStorage.getItem('preference_dark_mode') ?? 'false'),
        sound_enabled: preferencesData.sound_enabled ?? 
          JSON.parse(localStorage.getItem('preference_sound_enabled') ?? 'true'),
        privacy_mode: preferencesData.privacy_mode ?? 
          JSON.parse(localStorage.getItem('preference_privacy_mode') ?? 'false'),
      });

      // Load security settings with localStorage fallback
      setSecuritySettings({
        two_factor_enabled: preferencesData.two_factor_enabled ?? 
          JSON.parse(localStorage.getItem('security_two_factor_enabled') ?? 'false'),
        login_alerts: preferencesData.login_alerts ?? 
          JSON.parse(localStorage.getItem('security_login_alerts') ?? 'true'),
        session_timeout: preferencesData.session_timeout ?? 
          (localStorage.getItem('security_session_timeout') ?? '30'),
      });
      
      // Handle appointments data safely
      const appointmentsList = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData?.results || []);
      console.log('Settings: Raw appointments data:', appointmentsData);
      console.log('Settings: Processed appointments list:', appointmentsList);
      
      // Filter for upcoming appointments (scheduled or confirmed)
      const upcomingAppointments = appointmentsList.filter((apt: Appointment) => {
        const isUpcoming = apt.status === 'Scheduled' || apt.status === 'Confirmed';
        const isFuture = new Date(apt.scheduled_time) > new Date();
        console.log(`Settings: Appointment ${apt.id} - Status: ${apt.status}, Future: ${isFuture}, Time: ${apt.scheduled_time}`);
        return isUpcoming && isFuture;
      });
      
      console.log('Settings: Filtered upcoming appointments:', upcomingAppointments);
      setAppointments(upcomingAppointments);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('settings.error_loading'));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await patch('/users/profile/', formData);
      toast.success(t('settings.profile_updated'));
      
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('settings.error_updating'));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    toast.success(t('settings.language_changed'));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.invalid_image_type'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('settings.image_too_large'));
      return;
    }

    setUploadingImage(true);
    
    try {
      // Upload to backend
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/users/profile/avatar/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update form data with the backend URL
        setFormData(prev => ({ ...prev, profile_picture: data.avatar_url }));
        
        toast.success(t('settings.profile_picture_updated'));
        
        // Refresh user context to get updated avatar
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t('settings.error_uploading_image'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      // Remove from backend by uploading empty avatar
      const response = await fetch('/api/users/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ avatar: null }),
      });

      if (response.ok) {
        // Update form data
        setFormData(prev => ({ ...prev, profile_picture: '' }));
        
        toast.success(t('settings.profile_picture_removed'));
        
        // Refresh user context
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        throw new Error('Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error(t('settings.error_removing_image'));
    }
  };

  const handlePreferencesUpdate = async (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      // Try to update preferences on backend, but don't fail if endpoint doesn't exist
      await patch('/users/preferences/', { [key]: value });
      toast.success(t('settings.preferences_updated'));
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      if (error?.response?.status === 404) {
        // Endpoint doesn't exist, just store locally for now
        localStorage.setItem(`preference_${key}`, JSON.stringify(value));
        toast.success(t('settings.preferences_updated'));
      } else {
        toast.error(t('settings.error_updating_preferences'));
        // Revert on error
        setPreferences(preferences);
      }
    }
  };

  const handleSecurityUpdate = async (key: string, value: any) => {
    const newSettings = { ...securitySettings, [key]: value };
    setSecuritySettings(newSettings);
    
    try {
      // Try to update security settings on backend, but don't fail if endpoint doesn't exist
      await patch('/users/security/', { [key]: value });
      toast.success(t('settings.security_updated'));
    } catch (error: any) {
      console.error('Error updating security settings:', error);
      if (error?.response?.status === 404) {
        // Endpoint doesn't exist, just store locally for now
        localStorage.setItem(`security_${key}`, JSON.stringify(value));
        toast.success(t('settings.security_updated'));
      } else {
        toast.error(t('settings.error_updating_security'));
        // Revert on error
        setSecuritySettings(securitySettings);
      }
    }
  };

  const handleExportData = async () => {
    try {
      const response = await get('/users/export-data/');
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mental-health-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('settings.data_exported'));
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(t('settings.error_exporting_data'));
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('settings.confirm_delete_account'))) {
      try {
        await patch('/users/profile/', { is_active: false });
        toast.success(t('settings.account_deactivated'));
        // Redirect to login or home page
        window.location.href = '/';
      } catch (error) {
        console.error('Error deactivating account:', error);
        toast.error(t('settings.error_deleting_account'));
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
          <Button 
            variant="outline" 
            onClick={logout}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {t('nav.logout')}
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Profile Summary Card */}
          <Card className="lg:col-span-1 shadow-elegant h-fit">
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <ProfileAvatar 
                    user={{
                      ...user,
                      full_name: formData.full_name,
                      avatar: formData.profile_picture
                    }} 
                    size="xl" 
                    className="mb-4"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <CardTitle className="text-xl">{formData.full_name || user?.email || 'Patient'}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{formData.email}</p>
                <Badge variant="outline" className="mt-3">{t('settings.patient_badge')}</Badge>
                {formData.profile_picture && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveProfilePicture}
                    className="mt-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {t('settings.remove_picture')}
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Main Settings Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-2" />
                  {t('settings.profile')}
                </TabsTrigger>
                <TabsTrigger value="preferences">
                  <Globe className="h-4 w-4 mr-2" />
                  {t('settings.preferences')}
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  {t('settings.notifications')}
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  {t('settings.security')}
                </TabsTrigger>
                <TabsTrigger value="appointments">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('settings.appointments')}
                </TabsTrigger>
                <TabsTrigger value="faq">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {t('settings.faq')}
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>{t('settings.profile_info')}</CardTitle>
                    <CardDescription>{t('settings.profile_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">{t('settings.full_name')}</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="full_name"
                              className="pl-10"
                              value={formData.full_name}
                              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">{t('settings.email')}</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              className="pl-10"
                              value={formData.email}
                              disabled
                              title={t('settings.email_readonly')}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t('settings.phone')}</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+251 9XX XXX XXX"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date_of_birth">{t('settings.dob')}</Label>
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? t('common.saving') : t('common.save')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>{t('settings.my_appointments')}</CardTitle>
                    <CardDescription>{t('settings.appointments_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {appointments.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('settings.no_appointments')}</p>
                        <Link to="/therapists">
                          <Button className="mt-4 gradient-primary">
                            {t('settings.book_appointment')}
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <div key={appointment.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">
                                  {appointment.therapist?.full_name || appointment.therapist?.name || 'Therapist'}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {new Date(appointment.scheduled_time).toLocaleDateString()} at {' '}
                                  {new Date(appointment.scheduled_time).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                  })}
                                </p>
                                <Badge variant="outline" className="mt-2">
                                  {appointment.status}
                                </Badge>
                              </div>
                              <Link to={`/appointments/${appointment.id}`}>
                                <Button variant="outline" size="sm">
                                  {t('common.view')}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                        <Link to="/appointments">
                          <Button variant="outline" className="w-full">
                            {t('settings.view_all_appointments')}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>{t('settings.preferences')}</CardTitle>
                    <CardDescription>{t('settings.preferences_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="language">{t('settings.language')}</Label>
                        <Select value={language} onValueChange={handleLanguageChange}>
                          <SelectTrigger id="language">
                            <Globe className="h-4 w-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="amharic">አማርኛ (Amharic)</SelectItem>
                            <SelectItem value="afan_oromo">Afaan Oromoo</SelectItem>
                            <SelectItem value="tigrigna">ትግርኛ (Tigrigna)</SelectItem>
                            <SelectItem value="somali">Soomaali (Somali)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.language_help')}
                        </p>
                      </div>

                      <div className="border-t my-4" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {preferences.dark_mode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                            <div>
                              <Label>{t('settings.dark_mode')}</Label>
                              <p className="text-sm text-muted-foreground">{t('settings.dark_mode_desc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.dark_mode}
                            onCheckedChange={(checked) => handlePreferencesUpdate('dark_mode', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {preferences.sound_enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                            <div>
                              <Label>{t('settings.sound_effects')}</Label>
                              <p className="text-sm text-muted-foreground">{t('settings.sound_effects_desc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.sound_enabled}
                            onCheckedChange={(checked) => handlePreferencesUpdate('sound_enabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {preferences.privacy_mode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <div>
                              <Label>{t('settings.privacy_mode')}</Label>
                              <p className="text-sm text-muted-foreground">{t('settings.privacy_mode_desc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.privacy_mode}
                            onCheckedChange={(checked) => handlePreferencesUpdate('privacy_mode', checked)}
                          />
                        </div>
                      </div>

                      <div className="border-t my-4" />

                      <div className="space-y-4">
                        <h4 className="font-medium">{t('settings.data_management')}</h4>
                        <div className="grid gap-3">
                          <Button variant="outline" onClick={handleExportData} className="justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            {t('settings.export_data')}
                          </Button>
                          <Button variant="outline" className="justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            {t('settings.view_privacy_policy')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>{t('settings.notification_settings')}</CardTitle>
                    <CardDescription>{t('settings.notification_settings_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          <div>
                            <Label>{t('settings.enable_notifications')}</Label>
                            <p className="text-sm text-muted-foreground">{t('settings.enable_notifications_desc')}</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.notifications_enabled}
                          onCheckedChange={(checked) => handlePreferencesUpdate('notifications_enabled', checked)}
                        />
                      </div>

                      <div className="border-t my-4" />

                      <div className="space-y-4">
                        <h4 className="font-medium">{t('settings.notification_types')}</h4>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <div>
                              <Label>{t('settings.email_notifications')}</Label>
                              <p className="text-sm text-muted-foreground">{t('settings.email_notifications_desc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.email_notifications}
                            onCheckedChange={(checked) => handlePreferencesUpdate('email_notifications', checked)}
                            disabled={!preferences.notifications_enabled}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <div>
                              <Label>{t('settings.sms_notifications')}</Label>
                              <p className="text-sm text-muted-foreground">{t('settings.sms_notifications_desc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.sms_notifications}
                            onCheckedChange={(checked) => handlePreferencesUpdate('sms_notifications', checked)}
                            disabled={!preferences.notifications_enabled}
                          />
                        </div>
                      </div>

                      <div className="border-t my-4" />

                      <div className="space-y-4">
                        <h4 className="font-medium">{t('settings.notification_schedule')}</h4>
                        <p className="text-sm text-muted-foreground">{t('settings.notification_schedule_desc')}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="quiet_start">{t('settings.quiet_hours_start')}</Label>
                            <Input
                              id="quiet_start"
                              type="time"
                              defaultValue="22:00"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="quiet_end">{t('settings.quiet_hours_end')}</Label>
                            <Input
                              id="quiet_end"
                              type="time"
                              defaultValue="08:00"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>{t('settings.security_privacy')}</CardTitle>
                    <CardDescription>{t('settings.security_privacy_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <div>
                            <Label>{t('settings.two_factor_auth')}</Label>
                            <p className="text-sm text-muted-foreground">{t('settings.two_factor_auth_desc')}</p>
                          </div>
                        </div>
                        <Switch
                          checked={securitySettings.two_factor_enabled}
                          onCheckedChange={(checked) => handleSecurityUpdate('two_factor_enabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          <div>
                            <Label>{t('settings.login_alerts')}</Label>
                            <p className="text-sm text-muted-foreground">{t('settings.login_alerts_desc')}</p>
                          </div>
                        </div>
                        <Switch
                          checked={securitySettings.login_alerts}
                          onCheckedChange={(checked) => handleSecurityUpdate('login_alerts', checked)}
                        />
                      </div>

                      <div className="border-t my-4" />

                      <div className="space-y-2">
                        <Label htmlFor="session_timeout">{t('settings.session_timeout')}</Label>
                        <Select 
                          value={securitySettings.session_timeout} 
                          onValueChange={(value) => handleSecurityUpdate('session_timeout', value)}
                        >
                          <SelectTrigger id="session_timeout">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 {t('settings.minutes')}</SelectItem>
                            <SelectItem value="30">30 {t('settings.minutes')}</SelectItem>
                            <SelectItem value="60">1 {t('settings.hour')}</SelectItem>
                            <SelectItem value="120">2 {t('settings.hours')}</SelectItem>
                            <SelectItem value="never">{t('settings.never')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">{t('settings.session_timeout_desc')}</p>
                      </div>

                      <div className="border-t my-4" />

                      <div className="space-y-4">
                        <h4 className="font-medium text-destructive">{t('settings.danger_zone')}</h4>
                        <div className="border border-destructive/20 rounded-lg p-4 space-y-4">
                          <div>
                            <h5 className="font-medium">{t('settings.deactivate_account')}</h5>
                            <p className="text-sm text-muted-foreground mt-1">{t('settings.deactivate_account_desc')}</p>
                          </div>
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('settings.deactivate_account')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>{t('settings.faq_title')}</CardTitle>
                    <CardDescription>{t('settings.faq_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {faqs.map((faq, index) => (
                        <div key={index} className="border rounded-lg">
                          <button
                            onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                            className="w-full p-4 flex justify-between items-center hover:bg-accent/50 transition-colors rounded-lg"
                          >
                            <span className="font-medium text-left">{faq.question}</span>
                            {expandedFAQ === index ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                          </button>
                          {expandedFAQ === index && (
                            <div className="px-4 pb-4 text-muted-foreground">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t my-6" />
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        {t('settings.need_more_help')}
                      </p>
                      <Button variant="outline">
                        {t('settings.contact_support')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
