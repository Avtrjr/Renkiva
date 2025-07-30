import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Webhook, Save, TestTube, ExternalLink, Info } from 'lucide-react';

interface WebhookSettings {
  id?: string;
  webhook_url: string;
  enabled: boolean;
  events: string[];
}

const WebhookSettings = () => {
  const [settings, setSettings] = useState<WebhookSettings>({
    webhook_url: '',
    enabled: true,
    events: ['created', 'updated', 'deleted']
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadWebhookSettings();
    }
  }, [user]);

  const loadWebhookSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setSettings({
          id: data.id,
          webhook_url: data.webhook_url,
          enabled: data.enabled,
          events: data.events
        });
        setHasSettings(true);
      }
    } catch (error) {
      console.error('Error loading webhook settings:', error);
    }
  };

  const saveWebhookSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const webhookData = {
        user_id: user.id,
        webhook_url: settings.webhook_url,
        enabled: settings.enabled,
        events: settings.events,
        updated_at: new Date().toISOString()
      };

      if (hasSettings && settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('webhook_settings')
          .update(webhookData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('webhook_settings')
          .insert(webhookData)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setSettings(prev => ({ ...prev, id: data.id }));
          setHasSettings(true);
        }
      }

      toast({
        title: "Webhook Settings Saved",
        description: "Your webhook configuration has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving webhook settings:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save webhook settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    if (!settings.webhook_url) {
      toast({
        title: "No Webhook URL",
        description: "Please enter a webhook URL first.",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const testPayload = {
        show_id: 'test-id',
        title: 'Test Movie',
        action: 'test',
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        source: 'MeshTV',
        test: true
      };

      const response = await fetch(settings.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(testPayload)
      });

      toast({
        title: "Test Webhook Sent",
        description: "A test payload was sent to your webhook URL. Check your webhook logs to verify it was received.",
      });
    } catch (error) {
      console.error('Webhook test error:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const toggleEvent = (event: string) => {
    setSettings(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to configure webhook settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="w-5 h-5" />
          Webhook Settings
        </CardTitle>
        <CardDescription>
          Configure webhooks to receive notifications when content is uploaded or modified
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Webhook URL */}
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              id="webhook-url"
              type="url"
              value={settings.webhook_url}
              onChange={(e) => setSettings(prev => ({ ...prev, webhook_url: e.target.value }))}
              placeholder="https://your-server.com/webhook"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={testWebhook}
              disabled={testing || !settings.webhook_url}
            >
              {testing ? (
                <>Testing...</>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-1" />
                  Test
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Webhooks</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications for content events
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
          />
        </div>

        {/* Event Selection */}
        <div className="space-y-3">
          <Label>Events to Subscribe</Label>
          <div className="flex flex-wrap gap-2">
            {['created', 'updated', 'deleted'].map((event) => (
              <Badge
                key={event}
                variant={settings.events.includes(event) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleEvent(event)}
              >
                {event}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Click to toggle which events trigger your webhook
          </p>
        </div>

        {/* Webhook Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Your webhook will receive POST requests with JSON payloads containing:</p>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li><code>show_id</code> - The ID of the content</li>
                <li><code>action</code> - created, updated, or deleted</li>
                <li><code>title</code> - The content title</li>
                <li><code>user_id</code> - Your user ID</li>
                <li><code>timestamp</code> - When the event occurred</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Zapier Integration Hint */}
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>Zapier Integration:</strong> You can use this webhook with Zapier by creating a "Webhooks by Zapier" trigger. 
            Copy the webhook URL from Zapier and paste it above to automatically trigger Zaps when you upload content.
          </AlertDescription>
        </Alert>

        {/* Save Button */}
        <Button onClick={saveWebhookSettings} disabled={loading} className="w-full">
          {loading ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Webhook Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;