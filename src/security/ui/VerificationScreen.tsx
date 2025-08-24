// Security verification UI component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, Camera, Smartphone } from 'lucide-react';
import { VerificationManager } from '../oob/verificationManager';
import { DeviceAttestation } from '../attestation/deviceAttestation';

export const VerificationScreen: React.FC = () => {
  const [verificationStep, setVerificationStep] = useState<'device' | 'qr' | 'sas' | 'complete'>('device');
  const [deviceSecure, setDeviceSecure] = useState(false);
  const [sasWords, setSasWords] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);

  const verificationManager = new VerificationManager();
  const deviceAttestation = DeviceAttestation.getInstance();

  useEffect(() => {
    checkDeviceSecurity();
  }, []);

  const checkDeviceSecurity = async () => {
    try {
      await deviceAttestation.validateSecurityRequirements();
      setDeviceSecure(true);
      setVerificationStep('qr');
    } catch (error) {
      console.error('Device security check failed:', error);
    }
  };

  const handleQRScanned = async () => {
    // Simulate QR verification
    const peerId = 'demo-peer';
    const localKey = new Uint8Array(32);
    const remoteKey = new Uint8Array(32);
    
    const challenge = await verificationManager.initiateVerification(peerId, localKey, remoteKey);
    setSasWords(challenge.sas_words);
    setVerificationStep('sas');
  };

  const confirmSAS = async (confirmed: boolean) => {
    if (confirmed) {
      setVerified(true);
      setVerificationStep('complete');
    } else {
      setVerificationStep('qr');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Secure Mesh Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStep === 'device' && (
            <div className="text-center space-y-4">
              <Smartphone className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Device Security Check</h3>
              <p className="text-sm text-muted-foreground">
                Verifying device integrity and hardware security...
              </p>
              <Badge variant={deviceSecure ? "default" : "secondary"}>
                {deviceSecure ? "✓ Secure Device" : "⏳ Checking..."}
              </Badge>
            </div>
          )}

          {verificationStep === 'qr' && (
            <div className="text-center space-y-4">
              <Camera className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Scan QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Scan the QR code displayed by your peer to establish secure connection.
              </p>
              <Button onClick={handleQRScanned} className="w-full">
                QR Code Scanned
              </Button>
            </div>
          )}

          {verificationStep === 'sas' && (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Verify Authentication Words</h3>
              <p className="text-sm text-muted-foreground">
                Confirm these words match what your peer sees:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {sasWords.map((word, index) => (
                  <Badge key={index} variant="outline" className="text-lg py-2">
                    {word}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => confirmSAS(true)} className="flex-1">
                  ✓ Match
                </Button>
                <Button onClick={() => confirmSAS(false)} variant="outline" className="flex-1">
                  ✗ No Match
                </Button>
              </div>
            </div>
          )}

          {verificationStep === 'complete' && (
            <div className="text-center space-y-4">
              {verified ? (
                <>
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                  <h3 className="text-lg font-semibold text-green-600">Verification Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    Secure connection established. You can now send and receive content safely.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 mx-auto text-red-500" />
                  <h3 className="text-lg font-semibold text-red-600">Verification Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    Please try again with correct verification data.
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};