import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LegalAgreementModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function LegalAgreementModal({ open, onAccept, onDecline }: LegalAgreementModalProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const navigate = useNavigate();

  const canProceed = hasReadTerms && hasReadPrivacy;

  const openInNewTab = (path: string) => {
    window.open(path, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-lg border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">Welcome to MeshTV</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Before you start sharing and discovering content, please review our legal policies.
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-4 pr-4">
            <Card className="bg-background/50 border-border/30">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms" 
                    checked={hasReadTerms}
                    onCheckedChange={(checked) => setHasReadTerms(checked === true)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm font-medium text-foreground cursor-pointer">
                      I have read and agree to the Terms of Use
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our terms cover content sharing guidelines, platform usage, and user responsibilities.
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-primary text-xs"
                      onClick={() => openInNewTab('/legal/terms-of-use')}
                    >
                      Read Terms of Use <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-border/30">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="privacy" 
                    checked={hasReadPrivacy}
                    onCheckedChange={(checked) => setHasReadPrivacy(checked === true)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="privacy" className="text-sm font-medium text-foreground cursor-pointer">
                      I have read and understand the Privacy Policy
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Learn how MeshTV protects your privacy with local-first, offline mesh networking.
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-primary text-xs"
                      onClick={() => openInNewTab('/legal/privacy-policy')}
                    >
                      Read Privacy Policy <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/30 rounded-lg p-4 border border-border/20">
              <h4 className="text-sm font-medium text-foreground mb-2">🔒 Privacy Highlights</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Your videos stay on your device - no cloud uploads</li>
                <li>• Sharing happens only through local Bluetooth mesh</li>
                <li>• No tracking, no ads, no data mining</li>
                <li>• You control what you share and with whom</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
            Decline
          </Button>
          <Button 
            onClick={onAccept} 
            disabled={!canProceed}
            className="w-full sm:w-auto"
            variant={canProceed ? "default" : "secondary"}
          >
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}