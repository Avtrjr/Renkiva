import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useLocationConsent } from '@/hooks/useLocationConsent';
import { DataExportButton } from '@/components/DataExportButton';
import { DeleteAccountButton } from '@/components/DeleteAccountButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Shield, Download, Trash2, User, Bell, Lock, Mail, Smartphone, Camera, Loader2, Sun, Moon, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { hasConsent, loading: consentLoading, grantConsent, revokeConsent, consentGivenAt } = useLocationConsent();
  const [locationToggle, setLocationToggle] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasConsent !== null) {
      setLocationToggle(hasConsent);
    }
  }, [hasConsent]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, bio, email_notifications, push_notifications')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
        }
        
        if (data) {
          setDisplayName(data.display_name || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url);
          setEmailNotifications(data.email_notifications ?? true);
          setPushNotifications(data.push_notifications ?? false);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLocationToggle = async (checked: boolean) => {
    setLocationToggle(checked);
    if (checked) {
      await grantConsent();
    } else {
      await revokeConsent();
    }
  };

  const handleEmailNotificationsToggle = async (checked: boolean) => {
    if (!user) return;
    
    setEmailNotifications(checked);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications: checked, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      toast.success(checked ? 'Email notifications enabled' : 'Email notifications disabled');
    } catch (err) {
      console.error('Error updating email notifications:', err);
      setEmailNotifications(!checked); // Revert on error
      toast.error('Failed to update notification preference');
    }
  };

  const handlePushNotificationsToggle = async (checked: boolean) => {
    if (!user) return;
    
    setPushNotifications(checked);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ push_notifications: checked, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      toast.success(checked ? 'Push notifications enabled' : 'Push notifications disabled');
    } catch (err) {
      console.error('Error updating push notifications:', err);
      setPushNotifications(!checked); // Revert on error
      toast.error('Failed to update notification preference');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName.trim(),
          bio: bio.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('meshtv-library')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('meshtv-library')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Avatar updated successfully');
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Profile Section */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Customize your public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 cursor-pointer" onClick={handleAvatarClick}>
                    <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                    <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">
                    Click to upload a new photo (max 2MB)
                  </p>
                </div>
              </div>

              <Separator />

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    disabled={profileLoading}
                    maxLength={50}
                  />
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={saving || profileLoading}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is how you appear to other users in the mesh network.
                </p>
              </div>

              <Separator />

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">About</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others a bit about yourself..."
                  disabled={profileLoading}
                  maxLength={300}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    A short bio visible on your profile.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bio.length}/300
                  </p>
                </div>
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving || profileLoading}
                  className="w-full"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how RENKIVA looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary mt-0.5" />
                ) : (
                  <Sun className="h-5 w-5 text-primary mt-0.5" />
                )}
                <div className="space-y-1">
                  <Label htmlFor="theme-toggle" className="font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes for comfortable viewing.
                  </p>
                </div>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => {
                  setTheme(checked ? 'dark' : 'light');
                  toast.success(checked ? 'Dark mode enabled' : 'Light mode enabled');
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>
              Manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Sign in to manage your account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how you receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <Label htmlFor="email-notifications" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new content, network activity, and important announcements via email.
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={handleEmailNotificationsToggle}
              />
            </div>

            <Separator />

            {/* Push Notifications */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <Label htmlFor="push-notifications" className="font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get real-time alerts on your device when nearby content becomes available or when your broadcasts are viewed.
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={handlePushNotificationsToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>
              Control how your data is collected and used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Consent */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <Label htmlFor="location-consent" className="font-medium">
                    Location Access
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow RENKIVA to use your approximate location (~1km precision) for mesh network optimization and regional content.
                  </p>
                  {consentGivenAt && hasConsent && (
                    <p className="text-xs text-muted-foreground">
                      Enabled on {consentGivenAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Switch
                id="location-consent"
                checked={locationToggle}
                onCheckedChange={handleLocationToggle}
                disabled={consentLoading}
              />
            </div>

            <Separator />

            {/* Data Retention Info */}
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Data Retention</p>
                <p className="text-sm text-muted-foreground">
                  Location data is automatically deleted after 90 days. Your coordinates are rounded to ~1km precision to protect your privacy.
                </p>
              </div>
            </div>

            <Separator />

            {/* Data Export */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Export Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of all your data in machine-readable JSON format (GDPR Article 20).
                  </p>
                </div>
              </div>
              <DataExportButton />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium text-sm">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <DeleteAccountButton />
            </div>
          </CardContent>
        </Card>

        {/* Legal Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/legal/privacy-policy')}>
              Privacy Policy
            </Button>
            <br />
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/legal/terms-of-use')}>
              Terms of Use
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
