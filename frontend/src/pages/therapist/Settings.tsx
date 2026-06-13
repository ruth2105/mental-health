import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  User, Mail, Languages, FileText, Loader2, Globe, 
  Camera, Trash2, Shield, Bell, Lock, Calendar,
  DollarSign, Users, Download, Moon, Sun, Eye, Smartphone
} from 'lucide-react';

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { get, patch } = useApi();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    specialization: '',
    price: '',
    languages: '',
    profile_picture: '',
    phone: '',
    license_number: '',
    years_experience: '',
    education: '',
  });

  const [availability, setAvailability] = useState({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  });

  const [preferences, setPreferences] = useState({
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: false,
    dark_mode: false,
    sound_enabled: true,
    auto_accept_appointments: false,
    show_online_status: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    login_alerts: true,
    session_timeout: '30',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileData, preferencesData, availabilityData] = await Promise.all([
        get('/users/profile/'),
        get('/users/preferences/').catch(() => ({})),
        get('/therapists/availability/').catch(() => ({}))
      ]);
      
      setFormData({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        bio: profileData.profile?.bio || '',
        specialization: profileData.profile?.specialization || '',
        price: profileData.profile?.price || '',
        languages: profileData.profile?.languages || '',
        profile_picture: profileData.profile_picture || '',
        phone: profileData.phone || '',
        license_number: profileData.profile?.license_number || '',
        years_experience: profileData.profile?.years_experience || '',
        education: profileData.profile?.education || '',
      });

      setPreferences({
        notifications_enabled: preferencesData.notifications_enabled ?? true,
        email_notifications: preferencesData.email_notifications ?? true,
        sms_notifications: preferencesData.sms_notifications ?? false,
        dark_mode: preferencesData.dark_mode ?? false,
        sound_enabled: preferencesData.sound_enabled ?? true,
        auto_accept_appointments: preferencesData.auto_accept_appointments ?? false,
        show_online_status: preferencesData.show_online_status ?? true,
      });

      setSecuritySettings({
        two_factor_enabled: preferencesData.two_factor_enabled ?? false,
        login_alerts: preferencesData.login_alerts ?? true,
        session_timeout: preferencesData.session_timeout ?? '30',
      });

      if (availabilityData && Object.keys(availabilityData).length > 0) {
        setAvailability(availabilityData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('settings.error_loading'));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.invalid_image_type'));
      return;
    }

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
      // Remove from backend
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
      await patch('/users/preferences/', { [key]: value });
      toast.success(t('settings.preferences_updated'));
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      if (error?.response?.status === 404) {
        localStorage.setItem(`preference_${key}`, JSON.stringify(value));
        toast.success(t('settings.preferences_updated'));
      } else {
        toast.error(t('settings.error_updating_preferences'));
        setPreferences(preferences);
      }
    }
  };

  const handleSecurityUpdate = async (key: string, value: any) => {
    const newSettings = { ...securitySettings, [key]: value };
    setSecuritySettings(newSettings);
    
    try {
      await patch('/users/security/', { [key]: value });
      toast.success(t('settings.security_updated'));
    } catch (error: any) {
      console.error('Error updating security settings:', error);
      if (error?.response?.status === 404) {
        localStorage.setItem(`security_${key}`, JSON.stringify(value));
        toast.success(t('settings.security_updated'));
      } else {
        toast.error(t('settings.error_updating_security'));
        setSecuritySettings(securitySettings);
      }
    }
  };

  const handleAvailabilityUpdate = async (day: string, field: string, value: any) => {
    const newAvailability = {
      ...availability,
      [day]: { ...availability[day as keyof typeof availability], [field]: value }
    };
    setAvailability(newAvailability);
    
    try {
      await patch('/therapists/availability/', newAvailability);
      toast.success(t('settings.availability_updated'));
    } catch (error: any) {
      console.error('Error updating availability:', error);
      if (error?.response?.status === 404) {
        localStorage.setItem('therapist_availability', JSON.stringify(newAvailability));
        toast.success(t('settings.availability_updated'));
      } else {
        toast.error(t('settings.error_updating_availability'));
        setAvailability(availability);
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
      a.download = `therapist-data-${new Date().toISOString().split('T')[0]}.json`;
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
                <CardTitle className="text-xl">{formData.full_name || user?.email || 'Therapist'}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{formData.email}</p>
                <Badge variant="outline" className="mt-3">{t('settings.verified_therapist')}</Badge>
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-2" />
                  {t('settings.profile')}
                </TabsTrigger>
                <TabsTrigger value="availability">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('settings.availability')}
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
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>{t('settings.profile_info')}</CardTitle>
                    <CardDescription>{t('settings.therapist_profile_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                          <Label htmlFor="license_number">{t('settings.license_number')}</Label>
                          <Input
                            id="license_number"
                            placeholder="License #"
                            value={formData.license_number}
                            onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialization">{t('settings.specialization')}</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="specialization"
                            className="pl-10"
                            placeholder="e.g., Anxiety, Depression, PTSD"
                            value={formData.specialization}
                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">{t('settings.bio')}</Label>
                        <Textarea
                          id="bio"
                          placeholder={t('settings.bio_placeholder')}
                          className="min-h-[100px]"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">{t('settings.session_price')}</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="price"
                              type="number"
                              className="pl-10"
                              placeholder="500"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="years_experience">{t('settings.years_experience')}</Label>
                          <Input
                            id="years_experience"
                            type="number"
                            placeholder="5"
                            value={formData.years_experience}
                            onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="languages">{t('settings.languages')}</Label>
                          <div className="relative">
                            <Languages className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="languages"
                              className="pl-10"
                              placeholder="Amharic, English"
                              value={formData.languages}
                              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="education">{t('settings.education')}</Label>
                        <Textarea
                          id="education"
                          placeholder={t('settings.education_placeholder')}
                          value={formData.education}
                          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        />
                      </div>

                      <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? t('common.saving') : t('common.save')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Availability Tab */}
              <TabsContent value="availability">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>{t('settings.availability_schedule')}</CardTitle>
                    <CardDescription>{t('settings.availability_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(availability).map(([day, schedule]) => (
                      <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={schedule.enabled}
                            onCheckedChange={(checked) => handleAvailabilityUpdate(day, 'enabled', checked)}
                          />
                          <Label className="font-medium capitalize">{t(`settings.${day}`)}</Label>
                        </div>
                        {schedule.enabled && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={schedule.start}
                              onChange={(e) => handleAvailabilityUpdate(day, 'start', e.target.value)}
                              className="w-24"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={schedule.end}
                              onChange={(e) => handleAvailabilityUpdate(day, 'end', e.target.value)}
                              className="w-24"
                            />
                          </div>
                        )}
                      </div>
                    ))}
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
                            <Users className="h-4 w-4" />
                            <div>
                              <Label>{t('settings.auto_accept_appointments')}</Label>
                              <p className="text-sm text-muted-foreground">{t('settings.auto_accept_desc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.auto_accept_appointments}
                            onCheckedChange={(checked) => handlePreferencesUpdate('auto_accept_appointments', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <div>
                              <Label>{t('settings.show_online_status')}</Label>
                              <p className="text-sm text-muted-foreground">{t('settings.show_online_desc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.show_online_status}
                            onCheckedChange={(checked) => handlePreferencesUpdate('show_online_status', checked)}
                          />
                        </div>
                      </div>

                      <div className="border-t my-4" />

                      <div className="space-y-4">
                        <h4 className="font-medium">{t('settings.data_management')}</h4>
                        <Button variant="outline" onClick={handleExportData} className="justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          {t('settings.export_data')}
                        </Button>
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
                    <CardDescription>{t('settings.therapist_notification_desc')}</CardDescription>
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
                              <p className="text-sm text-muted-foreground">{t('settings.therapist_email_desc')}</p>
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
                              <p className="text-sm text-muted-foreground">{t('settings.therapist_sms_desc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences.sms_notifications}
                            onCheckedChange={(checked) => handlePreferencesUpdate('sms_notifications', checked)}
                            disabled={!preferences.notifications_enabled}
                          />
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
                    <CardDescription>{t('settings.therapist_security_desc')}</CardDescription>
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
