import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-card p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        </div>

        <Card className="bg-card/80 backdrop-blur-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Renkiva Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">1. Privacy-First Design</h3>
              <p className="text-muted-foreground">
                Renkiva is built with privacy as a core principle. Most of your data stays on your device and
                is shared only through local Bluetooth mesh networks. We collect minimal data and never sell your information.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">2. Data We Collect</h3>
              <p className="text-muted-foreground mb-2">Renkiva collects only essential information:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Account Data:</strong> Username, display name, optional avatar</li>
                <li><strong>Content Metadata:</strong> Video titles, descriptions, categories (not the videos themselves)</li>
                <li><strong>Usage Analytics:</strong> Anonymous viewing statistics for content optimization</li>
                <li><strong>Device Info:</strong> Basic device fingerprint for mesh network operation</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">3. Data Storage & Sharing</h3>
              <p className="text-muted-foreground">
                <strong>Local Storage:</strong> Videos and personal data stay on your device.
                <strong>Mesh Sharing:</strong> Content shared only with nearby devices you choose to connect with.
                <strong>Cloud Sync:</strong> Optional account sync for settings and metadata only (never video files).
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">4. No Tracking or Ads</h3>
              <p className="text-muted-foreground">
                Renkiva does not use tracking cookies, analytics that identify individuals, or targeted advertising.
                Sponsor content is distributed through the mesh network without personal data collection.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">5. Offline Operation</h3>
              <p className="text-muted-foreground">
                Most Renkiva functionality works completely offline. When online sync is enabled,
                only essential metadata is transmitted - never your actual video content.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">6. Your Rights</h3>
              <p className="text-muted-foreground">
                You can delete your account and all associated data at any time.
                Since data is primarily local, you control your privacy by managing your device storage.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">7. Contact</h3>
              <p className="text-muted-foreground">
                For privacy questions or data requests, contact us through the app settings or at privacy@renkiva.app
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}