import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, MapPin, Clock, Download, Trash2, Mail } from 'lucide-react';
import { DataExportButton } from '@/components/DataExportButton';
import { DeleteAccountButton } from '@/components/DeleteAccountButton';
import { useAuth } from '@/hooks/useAuth';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

        <Card className="bg-card/80 backdrop-blur-lg border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Renkiva Privacy Policy
            </CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
            <p className="text-sm text-muted-foreground">
              Compliant with GDPR (EU), CCPA (California), and other privacy regulations.
            </p>
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
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                2. Location Data
              </h3>
              <p className="text-muted-foreground mb-3">
                <strong>Notice at Collection (CCPA):</strong> We may collect location data to provide mesh network services.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Consent Required:</strong> Location access requires your explicit opt-in consent before any data is collected.</li>
                <li><strong>Data Minimization:</strong> We only store approximate location (~1km precision), never your exact GPS coordinates.</li>
                <li><strong>Purpose:</strong> Used for mesh node discovery, regional content delivery, and network optimization.</li>
                <li><strong>Retention:</strong> Location data is automatically deleted after 90 days.</li>
                <li><strong>Revocation:</strong> You can revoke location consent at any time in your account settings.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">3. Data We Collect</h3>
              <p className="text-muted-foreground mb-2">Renkiva collects only essential information:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Account Data:</strong> Username, display name, optional avatar</li>
                <li><strong>Content Metadata:</strong> Video titles, descriptions, categories (not the videos themselves)</li>
                <li><strong>Usage Analytics:</strong> Anonymous viewing statistics for content optimization</li>
                <li><strong>Device Info:</strong> Basic device fingerprint for mesh network operation (hashed and anonymized)</li>
                <li><strong>Location Data:</strong> Approximate coordinates (if consent given) for mesh discovery</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                4. Data Retention Periods
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Account Data:</strong> Retained until you delete your account</li>
                <li><strong>Location Data:</strong> Automatically deleted after 90 days</li>
                <li><strong>View Statistics:</strong> Automatically deleted after 90 days</li>
                <li><strong>Content Metadata:</strong> Retained while content exists, deleted with content</li>
                <li><strong>Mesh Network Data:</strong> Retained while node is active, cleared after 90 days of inactivity</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">5. Data Storage & Sharing</h3>
              <p className="text-muted-foreground">
                <strong>Local Storage:</strong> Videos and personal data stay on your device.<br />
                <strong>Mesh Sharing:</strong> Content shared only with nearby devices you choose to connect with.<br />
                <strong>Cloud Sync:</strong> Optional account sync for settings and metadata only (never video files).<br />
                <strong>Third Parties:</strong> We do not sell or share your personal data with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">6. No Tracking or Targeted Ads</h3>
              <p className="text-muted-foreground">
                Renkiva does not use tracking cookies, analytics that identify individuals, or targeted advertising.
                Sponsor content is distributed through the mesh network without personal data collection.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">7. Offline Operation</h3>
              <p className="text-muted-foreground">
                Most Renkiva functionality works completely offline. When online sync is enabled,
                only essential metadata is transmitted - never your actual video content.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Download className="h-4 w-4" />
                8. Your Rights (GDPR Article 12-23)
              </h3>
              <p className="text-muted-foreground mb-3">Under GDPR, CCPA, and other privacy laws, you have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
                <li><strong>Portability:</strong> Download your data in a machine-readable format (JSON)</li>
                <li><strong>Rectification:</strong> Correct any inaccurate personal data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Object:</strong> Object to processing of your data for certain purposes</li>
                <li><strong>Withdraw Consent:</strong> Revoke any consent you've given at any time</li>
              </ul>
              
              {user && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
                  <p className="text-sm font-medium text-foreground">Exercise your rights:</p>
                  <div className="flex flex-wrap gap-3">
                    <DataExportButton />
                    <DeleteAccountButton />
                  </div>
                </div>
              )}
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">9. California Privacy Rights (CCPA)</h3>
              <p className="text-muted-foreground mb-2">California residents have additional rights:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Right to Know:</strong> What personal information is collected, used, shared, or sold</li>
                <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                <li><strong>Right to Opt-Out:</strong> We do not sell personal information</li>
                <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">10. Data Security</h3>
              <p className="text-muted-foreground">
                We implement industry-standard security measures including encryption in transit and at rest,
                secure authentication, and regular security audits. Your mesh network communications are
                end-to-end encrypted.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">11. Children's Privacy</h3>
              <p className="text-muted-foreground">
                Renkiva is not intended for children under 13. We do not knowingly collect personal
                information from children under 13. If you believe we have collected such information,
                please contact us immediately.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                12. Contact & Data Protection Officer
              </h3>
              <p className="text-muted-foreground">
                For privacy questions, data requests, or to exercise your rights:<br /><br />
                <strong>Email:</strong> privacy@renkiva.app<br />
                <strong>Response Time:</strong> We respond to all requests within 30 days as required by GDPR.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">13. Policy Updates</h3>
              <p className="text-muted-foreground">
                We may update this policy periodically. Significant changes will be notified through the app.
                Continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 Renkiva. All rights reserved.</p>
          <p className="mt-2">
            <a href="/legal/terms-of-use" className="underline hover:text-foreground">Terms of Use</a>
          </p>
        </div>
      </div>
    </div>
  );
}
