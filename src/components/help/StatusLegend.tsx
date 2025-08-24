import React from 'react';
import { 
  Wifi, 
  Globe, 
  Zap, 
  Volume2, 
  ShieldAlert, 
  XCircle,
  Circle
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { StatusBadge } from '@/types/help';

interface StatusLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_BADGES: StatusBadge[] = [
  {
    key: 'local-mesh',
    label: 'Local Mesh',
    description: 'Direct device-to-device connection on your local network. Fastest and most secure.',
    color: 'bg-green-500',
    icon: 'wifi'
  },
  {
    key: 'global-direct',
    label: 'Global (Direct)',
    description: 'End-to-end encrypted connection worldwide via direct bridge tunnel.',
    color: 'bg-blue-500', 
    icon: 'globe'
  },
  {
    key: 'global-relaying',
    label: 'Global (Relaying)',
    description: 'Still end-to-end encrypted, but routing through relay servers. May add slight delay.',
    color: 'bg-yellow-500',
    icon: 'zap'
  },
  {
    key: 'audio-only',
    label: 'Audio Only',
    description: 'Video has been disabled to maintain call quality during poor network conditions.',
    color: 'bg-orange-500',
    icon: 'volume2'
  },
  {
    key: 'unverified-origin',
    label: 'Unverified Origin',
    description: 'Content is hidden until the sender\'s device has been verified for security.',
    color: 'bg-amber-500',
    icon: 'shield-alert'
  },
  {
    key: 'safety-blocked',
    label: 'Safety Blocked',
    description: 'Content has been blocked by safety policies or community moderation.',
    color: 'bg-red-500',
    icon: 'x-circle'
  }
];

const getIcon = (iconName: string) => {
  const iconMap = {
    wifi: Wifi,
    globe: Globe,
    zap: Zap,
    volume2: Volume2,
    'shield-alert': ShieldAlert,
    'x-circle': XCircle
  };
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Circle;
  return <IconComponent className="h-4 w-4" />;
};

export function StatusLegend({ isOpen, onClose }: StatusLegendProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Circle className="h-5 w-5" />
            Status Legend
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Understanding status indicators helps you know your connection state and troubleshoot issues.
          </p>
          
          <div className="space-y-4">
            {STATUS_BADGES.map((badge) => (
              <div 
                key={badge.key}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-3 h-3 rounded-full ${badge.color}`} />
                  {getIcon(badge.icon)}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm">{badge.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {badge.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Troubleshooting Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Poor quality? Try audio-only mode to stabilize</li>
              <li>• Can't connect globally? Check bridge status</li>
              <li>• Content blocked? Verify sender or check safety settings</li>
              <li>• High latency? Direct connection may be blocked</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}