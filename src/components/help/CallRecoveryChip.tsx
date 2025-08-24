import React from 'react';
import { Volume2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CallRecoveryChipProps {
  isVisible: boolean;
  onRetryAudioOnly: () => void;
  connectionQuality?: 'poor' | 'degraded' | 'unstable';
}

export function CallRecoveryChip({ 
  isVisible, 
  onRetryAudioOnly, 
  connectionQuality = 'poor' 
}: CallRecoveryChipProps) {
  if (!isVisible) return null;

  const getQualityText = () => {
    switch (connectionQuality) {
      case 'poor': return 'Poor connection detected';
      case 'degraded': return 'Video quality degraded';  
      case 'unstable': return 'Connection unstable';
      default: return 'Connection issues';
    }
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 p-3 rounded-full bg-background/95 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-800 shadow-lg">
        <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 dark:text-orange-300">
          {getQualityText()}
        </Badge>
        
        <Button 
          size="sm"
          onClick={onRetryAudioOnly}
          className="rounded-full px-4 py-2 h-auto bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:hover:bg-orange-900 dark:text-orange-200"
        >
          <Volume2 className="h-3 w-3 mr-1" />
          <span className="text-xs font-medium">Retry (Audio-only)</span>
          <RotateCcw className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}