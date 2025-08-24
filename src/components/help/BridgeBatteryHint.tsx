import React from 'react';
import { Battery, Zap, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BridgeBatteryHintProps {
  isVisible: boolean;
  onDisableBridge: () => void;
  onKeepOn: () => void;
  onDismiss: () => void;
  dataUsed?: number;
  batteryUsed?: number;
}

export function BridgeBatteryHint({ 
  isVisible, 
  onDisableBridge, 
  onKeepOn, 
  onDismiss,
  dataUsed = 0,
  batteryUsed = 0 
}: BridgeBatteryHintProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="p-4 shadow-lg border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <Battery className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm text-amber-900 dark:text-amber-100">
                Bridge Mode Active
              </h4>
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-300">
                Using Resources
              </Badge>
            </div>
            
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
              Bridge is still active and using battery/data. Consider disabling when not needed.
            </p>
            
            {(dataUsed > 0 || batteryUsed > 0) && (
              <div className="flex gap-4 mb-3 text-xs text-amber-600 dark:text-amber-400">
                {dataUsed > 0 && (
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {Math.round(dataUsed / 1024 / 1024)}MB used
                  </div>
                )}
                {batteryUsed > 0 && (
                  <div className="flex items-center gap-1">
                    <Battery className="h-3 w-3" />
                    {batteryUsed}% battery
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={onDisableBridge}
                className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
              >
                Disable Bridge
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={onKeepOn}
                className="text-xs text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
              >
                Keep On
              </Button>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
}