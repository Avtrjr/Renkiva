import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const FingerprintCard = () => {
  const [fingerprint] = useState("A1B2-C3D4-E5F6-G7H8");
  const { toast } = useToast();

  const copyFingerprint = async () => {
    try {
      await navigator.clipboard.writeText(fingerprint);
      toast({
        title: "Copied!",
        description: "Fingerprint copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const generateQR = () => {
    toast({
      title: "QR Code",
      description: "QR code sharing coming soon!",
    });
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          🔐 Device Identity
          <Badge variant="outline" className="text-xs">
            Encrypted
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patent Notice */}
        <div className="text-center">
          <span className="text-xs text-muted-foreground">Patent pending</span>
        </div>
        
        {/* Fingerprint Display */}
        <div className="p-4 bg-muted/20 rounded-2xl text-center">
          <p className="text-sm text-muted-foreground mb-2">Your Device Fingerprint</p>
          <div className="text-2xl font-mono font-bold text-primary tracking-wider">
            {fingerprint}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This unique ID identifies your device on the mesh network
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyFingerprint}
            className="w-full"
          >
            📋 Copy ID
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateQR}
            className="w-full"
          >
            📱 QR Code
          </Button>
        </div>

        {/* Peer Verification */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm font-medium text-foreground mb-3">Verify Peer Device</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter peer fingerprint..."
              className="flex-1 px-3 py-2 bg-input border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button variant="mesh" size="sm">
              ✓ Verify
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-aurora-mesh/10 rounded-xl border border-secondary/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary rounded-full animate-pulse-mesh"></div>
            <span className="text-sm font-medium">Mesh Network</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Connected
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default FingerprintCard;