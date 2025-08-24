import React from 'react';
import { 
  Smartphone, 
  Shield, 
  Phone, 
  Globe, 
  Share, 
  CheckCircle,
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuickStartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_START_STEPS = [
  {
    icon: Smartphone,
    title: 'Welcome to Mesh TV',
    description: 'Your decentralized, private communication network',
    badge: 'Setup'
  },
  {
    icon: Shield,
    title: 'Verify Devices',
    description: 'Scan QR codes to verify devices and ensure secure communication',
    action: 'Tap Verify button',
    badge: 'Security'
  },
  {
    icon: Phone,
    title: 'Start Local Calls',
    description: 'Make private video calls over your local mesh network',
    action: 'Tap Start Call',
    badge: 'Local'
  },
  {
    icon: Globe,
    title: 'Go Global',
    description: 'Connect worldwide via encrypted bridge tunnels',
    action: 'Enable Global Mode',
    badge: 'Global'
  },
  {
    icon: Share,
    title: 'Share Safely',
    description: 'Send files with Safety Manifests for secure content sharing',
    action: 'Use Share button',
    badge: 'Content'
  }
];

export function QuickStartSheet({ isOpen, onClose }: QuickStartSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Quick Start Guide
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5">
            <h3 className="font-semibold mb-2">Get Started in 60 Seconds</h3>
            <p className="text-sm text-muted-foreground">
              Follow these steps to unlock secure, decentralized communication
            </p>
          </div>
          
          <div className="space-y-4">
            {QUICK_START_STEPS.map((step, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {step.badge}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  
                  {step.action && (
                    <div className="text-xs font-medium text-primary">
                      → {step.action}
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0 text-xs text-muted-foreground font-mono">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">
                Privacy First
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                All communication is end-to-end encrypted. Your data never leaves your control.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-sm text-green-900 dark:text-green-100 mb-1">
                Works Offline
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300">
                Local mesh works without internet. Global mode extends your reach worldwide.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} className="flex-1">
              Start Using Mesh TV
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}