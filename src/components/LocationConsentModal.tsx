import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Clock, Settings } from 'lucide-react';

interface LocationConsentModalProps {
  open: boolean;
  onConsent: () => void;
  onDecline: () => void;
}

export function LocationConsentModal({ open, onConsent, onDecline }: LocationConsentModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location Access Request
          </DialogTitle>
          <DialogDescription>
            RENKIVA would like to use your location to enhance your mesh network experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Privacy Protected</p>
                <p className="text-xs text-muted-foreground">
                  Your exact location is never stored. We only use approximate coordinates (~1km precision).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Auto-Deleted</p>
                <p className="text-xs text-muted-foreground">
                  All location data is automatically deleted after 90 days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Your Control</p>
                <p className="text-xs text-muted-foreground">
                  You can revoke access anytime in your account settings.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>How we use location:</strong> To discover nearby mesh nodes, 
              optimize content delivery in your area, and show regional content recommendations.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
            Not Now
          </Button>
          <Button onClick={onConsent} className="w-full sm:w-auto">
            Allow Location Access
          </Button>
        </DialogFooter>

        <p className="text-xs text-center text-muted-foreground mt-2">
          By allowing, you agree to our{' '}
          <a href="/legal/privacy-policy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
