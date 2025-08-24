import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { capacitorSecurity, mobileSecurityMonitor } from '@/security/mobile/CapacitorIntegration';
import { policyManager } from '@/security/policy/PolicyManager';
import { nsfwClassifier } from '@/security/nsfw/NsfwClassifier';
import { bulletinStore } from '@/security/bulletin/ModerationBulletin';

interface SecurityContextType {
  isInitialized: boolean;
  isSecure: boolean;
  capabilities: any;
  errors: string[];
  initializeSecurity: () => Promise<void>;
  checkContentSafety: (file: File) => Promise<{ safe: boolean; score: number }>;
  reportContent: (manifest: any, file: File, reason: string, description: string) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [capabilities, setCapabilities] = useState(null);
  const [errors, setErrors] = useState<string[]>([]);

  const initializeSecurity = async () => {
    const initErrors: string[] = [];

    try {
      // 1. Initialize mobile security
      await capacitorSecurity.initialize();
      const caps = capacitorSecurity.getCapabilities();
      setCapabilities(caps);

      // 2. Perform device attestation
      const attestation = await capacitorSecurity.attestDevice();
      if (!attestation.success) {
        initErrors.push(`Device attestation failed: ${attestation.error}`);
      }

      // 3. Check for tampering
      const tamperingCheck = await capacitorSecurity.detectTamperingAttempts();
      if (tamperingCheck.compromised) {
        initErrors.push(`Security threats detected: ${tamperingCheck.threats.join(', ')}`);
      }

      // 4. Load content policy
      await policyManager.load();

      // 5. Initialize NSFW classifier
      await nsfwClassifier.initialize();

      // 6. Start security monitoring
      mobileSecurityMonitor.startMonitoring();

      // 7. Set up event handlers
      mobileSecurityMonitor.addEventListener('app_backgrounded', () => {
        console.log('App backgrounded - pausing sensitive operations');
      });

      mobileSecurityMonitor.addEventListener('app_foregrounded', async () => {
        console.log('App foregrounded - resuming operations');
        // Re-check security state
        const freshCheck = await capacitorSecurity.detectTamperingAttempts();
        if (freshCheck.compromised) {
          setErrors(prev => [...prev, 'New security threats detected']);
        }
      });

      setErrors(initErrors);
      setIsSecure(initErrors.length === 0);
      setIsInitialized(true);

      console.log('Security layer initialized successfully');
    } catch (error) {
      console.error('Security initialization failed:', error);
      setErrors(['Security initialization failed']);
      setIsSecure(false);
      setIsInitialized(true);
    }
  };

  const checkContentSafety = async (file: File) => {
    try {
      // 1. Check MIME type
      if (!policyManager.isAllowed(file.type as any)) {
        return { safe: false, score: 1.0 };
      }

      // 2. Check NSFW if it's media
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        const bitmap = await createImageBitmap(img);
        const result = await nsfwClassifier.score(bitmap);
        bitmap.close();
        URL.revokeObjectURL(img.src);
        
        const threshold = policyManager.getNsfwThreshold();
        return { safe: result.score < threshold, score: result.score };
      }

      return { safe: true, score: 0.0 };
    } catch (error) {
      console.error('Content safety check failed:', error);
      return { safe: false, score: 1.0 };
    }
  };

  const reportContent = async (manifest: any, file: File, reason: string, description: string) => {
    try {
      // This would integrate with the report manager
      console.log('Content reported:', { reason, description });
      return true;
    } catch (error) {
      console.error('Report submission failed:', error);
      return false;
    }
  };

  useEffect(() => {
    initializeSecurity();
  }, []);

  const contextValue: SecurityContextType = {
    isInitialized,
    isSecure,
    capabilities,
    errors,
    initializeSecurity,
    checkContentSafety,
    reportContent
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurityContext() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
}

// Security status indicator component
export function SecurityStatusIndicator() {
  const { isInitialized, isSecure, errors } = useSecurityContext();

  if (!isInitialized) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        Initializing security...
      </div>
    );
  }

  if (!isSecure) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <div className="w-2 h-2 bg-destructive rounded-full" />
        Security issues detected
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full" />
      Secure
    </div>
  );
}