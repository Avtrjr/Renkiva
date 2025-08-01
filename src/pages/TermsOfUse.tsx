import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-card p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Terms of Use</h1>
        </div>

        <Card className="bg-card/80 backdrop-blur-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">MeshTV Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By accessing and using MeshTV, you accept and agree to be bound by the terms and provision of this agreement.
                MeshTV is a decentralized, offline-first content sharing platform that operates via Bluetooth Low Energy (BLE) mesh networking.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">2. Content Guidelines</h3>
              <p className="text-muted-foreground mb-2">Users agree to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Only share content they own or have permission to distribute</li>
                <li>Respect copyright and intellectual property rights</li>
                <li>Not share illegal, harmful, or inappropriate content</li>
                <li>Use the platform responsibly within their local mesh network</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">3. Offline & Decentralized Nature</h3>
              <p className="text-muted-foreground">
                MeshTV operates primarily offline through BLE mesh networking. Users acknowledge that:
                content is shared peer-to-peer, the platform cannot monitor all shared content in real-time,
                and users are responsible for content they choose to download and share.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">4. Privacy & Data</h3>
              <p className="text-muted-foreground">
                MeshTV is designed with privacy-first principles. Most data stays on your device.
                See our Privacy Policy for detailed information about data handling.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">5. Limitation of Liability</h3>
              <p className="text-muted-foreground">
                MeshTV is provided "as is" without warranties. The platform facilitates peer-to-peer sharing
                and cannot be held liable for content shared between users or technical issues with mesh networking.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">6. Changes to Terms</h3>
              <p className="text-muted-foreground">
                These terms may be updated periodically. Continued use of MeshTV constitutes acceptance of updated terms.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}