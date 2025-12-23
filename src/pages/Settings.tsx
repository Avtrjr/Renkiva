import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Shield, Download, Trash2, User, Bell, Lock, Mail, Smartphone, Camera, Loader2, Sun, Moon, Palette, Twitter, Github, Globe, Link, Monitor, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { changeLanguage, languageNames, isRTL } from '@/i18n';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { hasConsent, loading: consentLoading, grantConsent, revokeConsent, consentGivenAt } = useLocationConsent();
  const [locationToggle, setLocationToggle] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [languagePreference, setLanguagePreference] = useState('en');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // URL validation errors
  const [urlErrors, setUrlErrors] = useState<{
    twitter?: string;
    github?: string;
    website?: string;
  }>({});

  const validateUrl = (url: string, type: 'twitter' | 'github' | 'website'): string | undefined => {
    if (!url.trim()) return undefined;
    
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      
      if (type === 'twitter') {
        if (!parsed.hostname.includes('twitter.com') && !parsed.hostname.includes('x.com')) {
          return t('validation.invalidTwitterUrl');
        }
      } else if (type === 'github') {
        if (!parsed.hostname.includes('github.com')) {
          return t('validation.invalidGithubUrl');
        }
      }
      
      return undefined;
    } catch {
      return t('validation.invalidUrl');
    }
  };

  const handleSocialUrlChange = (value: string, type: 'twitter' | 'github' | 'website') => {
    const setters = { twitter: setTwitterUrl, github: setGithubUrl, website: setWebsiteUrl };
    setters[type](value);
    
    const error = validateUrl(value, type);
    setUrlErrors(prev => ({ ...prev, [type]: error }));
  };

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
          .select('display_name, avatar_url, bio, twitter_url, github_url, website_url, email_notifications, push_notifications, language_preference')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
        }
        
        if (data) {
          setDisplayName(data.display_name || '');
          setBio(data.bio || '');
          setTwitterUrl(data.twitter_url || '');
          setGithubUrl(data.github_url || '');
          setWebsiteUrl(data.website_url || '');
          setAvatarUrl(data.avatar_url);
          setEmailNotifications(data.email_notifications ?? true);
          setPushNotifications(data.push_notifications ?? false);
          setLanguagePreference(data.language_preference || 'en');
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
      toast.success(checked ? t('toast.emailNotificationsEnabled') : t('toast.emailNotificationsDisabled'));
    } catch (err) {
      console.error('Error updating email notifications:', err);
      setEmailNotifications(!checked); // Revert on error
      toast.error(t('toast.profileError'));
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
      toast.success(checked ? t('toast.pushNotificationsEnabled') : t('toast.pushNotificationsDisabled'));
    } catch (err) {
      console.error('Error updating push notifications:', err);
      setPushNotifications(!checked); // Revert on error
      toast.error(t('toast.profileError'));
    }
  };

  const handleLanguageChange = async (value: string) => {
    if (!user) return;
    
    const previousValue = languagePreference;
    setLanguagePreference(value);
    
    // Update i18n immediately
    changeLanguage(value);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ language_preference: value, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(t('toast.languageChanged', { language: languageNames[value] || value }));
    } catch (err) {
      console.error('Error updating language preference:', err);
      setLanguagePreference(previousValue);
      changeLanguage(previousValue);
      toast.error(t('toast.profileError'));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    // Validate all URLs before saving
    const twitterError = validateUrl(twitterUrl, 'twitter');
    const githubError = validateUrl(githubUrl, 'github');
    const websiteError = validateUrl(websiteUrl, 'website');
    
    setUrlErrors({
      twitter: twitterError,
      github: githubError,
      website: websiteError
    });
    
    if (twitterError || githubError || websiteError) {
      toast.error(t('toast.urlError'));
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName.trim(),
          bio: bio.trim(),
          twitter_url: twitterUrl.trim() || null,
          github_url: githubUrl.trim() || null,
          website_url: websiteUrl.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(t('toast.profileUpdated'));
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(t('toast.profileError'));
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
      toast.error(t('settings.profile.invalidFileType'));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('settings.profile.fileTooLarge'));
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
      toast.success(t('settings.profile.avatarUpdated'));
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error(t('settings.profile.avatarError'));
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
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
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
          <h1 className="text-xl font-semibold">{t('settings.title')}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Profile Section */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('settings.profile.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.profile.description')}
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
                  <p className="font-medium text-sm">{t('settings.profile.photo')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.profile.photoDescription')}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display-name">{t('settings.profile.displayName')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t('settings.profile.displayNamePlaceholder')}
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
                      t('common.save')
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('settings.profile.displayNameDescription')}
                </p>
              </div>

              <Separator />

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">{t('settings.profile.bio')}</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('settings.profile.bioPlaceholder')}
                  disabled={profileLoading}
                  maxLength={300}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {t('settings.profile.bioDescription')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bio.length}/300
                  </p>
                </div>
              </div>

              <Separator />

              {/* Social Links */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">{t('settings.profile.socialLinks')}</Label>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={twitterUrl}
                        onChange={(e) => handleSocialUrlChange(e.target.value, 'twitter')}
                        placeholder={t('settings.profile.twitterPlaceholder')}
                        disabled={profileLoading}
                        className={urlErrors.twitter ? 'border-destructive' : ''}
                      />
                    </div>
                    {urlErrors.twitter && (
                      <p className="text-xs text-destructive ml-6">{urlErrors.twitter}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={githubUrl}
                        onChange={(e) => handleSocialUrlChange(e.target.value, 'github')}
                        placeholder={t('settings.profile.githubPlaceholder')}
                        disabled={profileLoading}
                        className={urlErrors.github ? 'border-destructive' : ''}
                      />
                    </div>
                    {urlErrors.github && (
                      <p className="text-xs text-destructive ml-6">{urlErrors.github}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={websiteUrl}
                        onChange={(e) => handleSocialUrlChange(e.target.value, 'website')}
                        placeholder={t('settings.profile.websitePlaceholder')}
                        disabled={profileLoading}
                        className={urlErrors.website ? 'border-destructive' : ''}
                      />
                    </div>
                    {urlErrors.website && (
                      <p className="text-xs text-destructive ml-6">{urlErrors.website}</p>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {t('settings.profile.socialLinksDescription')}
                </p>
              </div>

              <Separator />

              <Button 
                onClick={handleSaveProfile} 
                disabled={saving || profileLoading}
                className="w-full"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t('settings.profile.saveProfile')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('settings.appearance.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.appearance.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary mt-0.5" />
                ) : theme === 'light' ? (
                  <Sun className="h-5 w-5 text-primary mt-0.5" />
                ) : (
                  <Monitor className="h-5 w-5 text-primary mt-0.5" />
                )}
                <div className="space-y-1">
                  <Label htmlFor="theme-select" className="font-medium">
                    {t('settings.appearance.theme')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.appearance.themeDescription')}
                  </p>
                </div>
              </div>
              <Select
                value={theme}
                onValueChange={(value) => {
                  setTheme(value);
                  const toastKey = value === 'light' ? 'themeLight' : value === 'dark' ? 'themeDark' : 'themeSystem';
                  toast.success(t(`toast.${toastKey}`));
                }}
              >
                <SelectTrigger id="theme-select" className="w-[130px]">
                  <SelectValue placeholder={t('settings.appearance.theme')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      {t('settings.appearance.light')}
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      {t('settings.appearance.dark')}
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      {t('settings.appearance.system')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language Preference */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Languages className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <Label htmlFor="language-select" className="font-medium">
                    {t('settings.appearance.language')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.appearance.languageDescription')}
                  </p>
                </div>
              </div>
              <Select
                value={languagePreference}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger id="language-select" className="w-[160px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageNames).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center gap-2">
                        <span>{name}</span>
                        {isRTL(code) && (
                          <span className="text-xs text-muted-foreground px-1 py-0.5 bg-muted rounded">
                            RTL
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('settings.account.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.account.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">{t('settings.account.email')}</div>
                <div className="font-medium">{user.email}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  {t('auth.signIn')}
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
              {t('settings.notifications.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.notifications.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <Label htmlFor="email-notifications" className="font-medium">
                    {t('settings.notifications.email')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.notifications.emailDescription')}
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
                    {t('settings.notifications.push')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.notifications.pushDescription')}
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
              {t('settings.privacy.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.privacy.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Consent */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <Label htmlFor="location-consent" className="font-medium">
                    {t('settings.privacy.location')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.privacy.locationDescription')}
                  </p>
                  {consentGivenAt && hasConsent && (
                    <p className="text-xs text-muted-foreground">
                      {t('settings.privacy.consentGiven', { date: consentGivenAt.toLocaleDateString() })}
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
                <p className="font-medium text-sm">{t('settings.privacy.dataRetention')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.privacy.dataRetentionDescription')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Data Export */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">{t('settings.privacy.dataExport')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.privacy.dataExportDescription')}
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
              {t('settings.privacy.deleteAccount')}
            </CardTitle>
            <CardDescription>
              {t('settings.privacy.deleteAccountDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium text-sm">{t('settings.privacy.deleteAccount')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.privacy.deleteAccountDescription')}
                </p>
              </div>
              <DeleteAccountButton />
            </div>
          </CardContent>
        </Card>

        {/* Legal Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.legal.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/legal/privacy-policy')}>
              {t('settings.legal.privacyPolicy')}
            </Button>
            <br />
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/legal/terms-of-use')}>
              {t('settings.legal.termsOfUse')}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
