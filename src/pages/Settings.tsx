import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLocationConsent } from '@/hooks/useLocationConsent';
import { DataExportButton } from '@/components/DataExportButton';
import { DeleteAccountButton } from '@/components/DeleteAccountButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Shield, Download, Trash2, User, Bell, Lock, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasConsent, loading: consentLoading, grantConsent, revokeConsent, consentGivenAt } = useLocationConsent();
  const [locationToggle, setLocationToggle] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  useEffect(() => {
    if (hasConsent !== null) {
      setLocationToggle(hasConsent);
    }
  }, [hasConsent]);

  const handleLocationToggle = async (checked: boolean) => {
    setLocationToggle(checked);
    if (checked) {
      await grantConsent();
    } else {
      await revokeConsent();
    }
  };

  const handleEmailNotificationsToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    toast.success(checked ? 'Email notifications enabled' : 'Email notifications disabled');
  };

  const handlePushNotificationsToggle = (checked: boolean) => {
    setPushNotifications(checked);
    toast.success(checked ? 'Push notifications enabled' : 'Push notifications disabled');
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
