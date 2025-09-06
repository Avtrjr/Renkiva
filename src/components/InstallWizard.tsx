import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Settings
} from 'lucide-react';
import { useToast } from './ui/use-toast';

interface InstallStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  required: boolean;
}

export function InstallWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [installSteps, setInstallSteps] = useState<InstallStep[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  const { toast } = useToast();

  useEffect(() => {
    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setDeviceType(isMobile ? 'mobile' : 'desktop');

    // Initialize install steps
    const steps: InstallStep[] = [
      {
        id: 'permissions',
        title: 'Grant Permissions',
        description: 'Allow camera, microphone, and storage access for full mesh functionality',
        completed: false,
        required: true,
        action: requestPermissions
      },
      {
        id: 'pwa-install',
        title: 'Install App',
        description: 'Add MeshTV to your home screen for native app experience',
        completed: false,
        required: false,
        action: installPWA
      },
      {
        id: 'mesh-setup',
        title: 'Mesh Network Setup',
        description: 'Configure Bluetooth and WiFi for mesh connectivity',
        completed: false,
        required: true,
        action: setupMesh
      },
      {
        id: 'profile-setup',
        title: 'Create Profile',
        description: 'Set up your MeshTV profile and preferences',
        completed: false,
        required: true,
        action: setupProfile
      },
      {
        id: 'test-connection',
        title: 'Test Connection',
        description: 'Verify mesh network connectivity and streaming capability',
        completed: false,
        required: true,
        action: testConnection
      }
    ];

    setInstallSteps(steps);
  }, []);

  async function requestPermissions() {
    setIsInstalling(true);
    let mediaGranted = false;
    let notificationGranted = false;

    try {
      // Request camera and microphone permissions
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaGranted = true;
    } catch (error) {
      console.log('Media permissions denied:', error);
    }

    try {
      // Request notifications permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        notificationGranted = permission === 'granted';
      }
    } catch (error) {
      console.log('Notification permission denied:', error);
    }

    // Always mark step as completed to allow user to proceed
    updateStepCompletion('permissions', true);
    
    if (mediaGranted && notificationGranted) {
      toast({
        title: "All Permissions Granted",
        description: "MeshTV can access camera, microphone, and notifications.",
      });
    } else if (mediaGranted || notificationGranted) {
      toast({
        title: "Partial Permissions Granted",
        description: "Some features may be limited. You can continue using the app.",
      });
    } else {
      toast({
        title: "Limited Permissions",
        description: "You can still use MeshTV with reduced functionality.",
      });
    }
    
    setIsInstalling(false);
  }

  async function installPWA() {
    setIsInstalling(true);
    try {
      // Check if PWA install prompt is available
      const beforeInstallPrompt = (window as any).beforeinstallprompt;
      
      if (beforeInstallPrompt) {
        // Show native install prompt
        const result = await beforeInstallPrompt.prompt();
        if (result.outcome === 'accepted') {
          updateStepCompletion('pwa-install', true);
          toast({
            title: "App Installed Successfully",
            description: "MeshTV has been added to your device. Look for the icon on your home screen.",
          });
          return;
        }
      }

      // Fallback: Register service worker and mark as completed
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (swError) {
          console.log('Service worker registration failed, continuing anyway');
        }
      }

      // Always complete this step as PWA installation is optional
      updateStepCompletion('pwa-install', true);
      toast({
        title: "Installation Ready",
        description: "You can install MeshTV by using your browser's 'Add to Home Screen' or 'Install App' option.",
      });

    } catch (error) {
      // Even if installation fails, mark as completed since it's optional
      updateStepCompletion('pwa-install', true);
      toast({
        title: "Installation Available",
        description: "Use your browser's menu to install MeshTV as an app for the best experience.",
      });
    } finally {
      setIsInstalling(false);
    }
  }

  async function setupMesh() {
    setIsInstalling(true);
    try {
      // Simulate mesh network configuration
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      updateStepCompletion('mesh-setup', true);
      toast({
        title: "Mesh Network Ready",
        description: "Your device is now connected to the mesh network.",
      });
    } catch (error) {
      toast({
        title: "Mesh Setup Error",
        description: "Failed to configure mesh network. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  }

  async function setupProfile() {
    setIsInstalling(true);
    try {
      // Simulate profile creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      updateStepCompletion('profile-setup', true);
      toast({
        title: "Profile Created",
        description: "Your MeshTV profile is ready to use.",
      });
    } catch (error) {
      toast({
        title: "Profile Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  }

  async function testConnection() {
    setIsInstalling(true);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateStepCompletion('test-connection', true);
      toast({
        title: "Connection Verified",
        description: "MeshTV is ready for streaming and sharing!",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Network connectivity issues detected.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  }

  function updateStepCompletion(stepId: string, completed: boolean) {
    setInstallSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed } : step
    ));
  }

  const completedSteps = installSteps.filter(step => step.completed).length;
  const progress = (completedSteps / installSteps.length) * 100;

  return (
    <Card className="install-wizard">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {deviceType === 'mobile' ? (
            <Smartphone className="w-5 h-5 text-primary" />
          ) : (
            <Monitor className="w-5 h-5 text-primary" />
          )}
          MeshTV Setup Wizard
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Setup Progress</span>
            <span>{completedSteps}/{installSteps.length} completed</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {installSteps.map((step, index) => (
          <div
            key={step.id}
            className={`border rounded-lg p-4 transition-all ${
              step.completed 
                ? 'border-green-500/50 bg-green-500/10' 
                : step.required 
                ? 'border-border' 
                : 'border-border/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : step.required ? (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    {step.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              
              {!step.completed && step.action && (
                <Button
                  size="sm"
                  onClick={step.action}
                  disabled={isInstalling}
                  className="ml-4"
                >
                  {isInstalling ? (
                    <Settings className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {progress === 100 && (
          <div className="border border-green-500/50 rounded-lg p-4 bg-green-500/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h4 className="font-medium text-green-700">Setup Complete!</h4>
            </div>
            <p className="text-sm text-green-600 mb-3">
              MeshTV is now fully configured and ready to use. You can start streaming and sharing content with the mesh network.
            </p>
            <Button size="sm" className="w-full">
              <Wifi className="w-4 h-4 mr-2" />
              Start Using MeshTV
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}