import React from 'react';
import { Shield, ExternalLink, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PolicyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLearnMore: () => void;
  blockReason?: string;
  contentType?: string;
  origin?: string;
}

export function PolicyDialog({ 
  isOpen, 
  onClose, 
  onLearnMore,
  blockReason = 'Safety policy violation',
  contentType = 'content',
  origin
}: PolicyDialogProps) {
  const getBlockReasonDetails = () => {
    switch (blockReason) {
      case 'missing-manifest':
        return {
          title: 'Missing Safety Manifest',
          description: 'This content lacks a required Safety Manifest signature.',
          action: 'Ask the sender to re-share with a valid manifest.'
        };
      case 'unverified-origin':
        return {
          title: 'Unverified Sender',
          description: 'Content from unverified devices is hidden for security.',
          action: 'Verify the sender\'s device first, then request content again.'
        };
      case 'community-guidelines':
        return {
          title: 'Community Guidelines',
          description: 'Content violates community standards or safety policies.',
          action: 'Review community guidelines or report if this seems incorrect.'
        };
      case 'moderation-bulletin':
        return {
          title: 'Blocked by Moderation',
          description: 'Content blocked by a community moderation bulletin.',
          action: 'Contact moderators if you believe this is an error.'
        };
      default:
        return {
          title: 'Safety Blocked',
          description: 'Content blocked by safety policies.',
          action: 'Review safety settings or contact support.'
        };
    }
  };

  const details = getBlockReasonDetails();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            {details.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-900 dark:text-red-100 mb-2">
                {details.description}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                {details.action}
              </p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Content Type:</span>
              <Badge variant="outline" className="text-xs">
                {contentType}
              </Badge>
            </div>
            
            {origin && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Origin:</span>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {origin.slice(0, 12)}...
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Block Reason:</span>
              <span className="text-xs">{blockReason}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onLearnMore} className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Learn Why
          </Button>
          <Button onClick={onClose}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}