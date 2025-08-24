import React, { useState, useEffect } from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCoachMarks } from '@/hooks/useCoachMarks';
import type { CoachMarkTarget } from '@/types/help';

interface CoachMarkProps {
  target: CoachMarkTarget;
  isVisible: boolean;
  onDismiss: () => void;
  targetElement?: HTMLElement;
}

const ARROW_ICONS = {
  top: ArrowUp,
  bottom: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight
};

export function CoachMark({ target, isVisible, onDismiss, targetElement }: CoachMarkProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ArrowIcon = ARROW_ICONS[target.placement];

  useEffect(() => {
    if (targetElement && isVisible) {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top = rect.top + scrollTop;
      let left = rect.left + scrollLeft;
      
      // Adjust position based on placement
      switch (target.placement) {
        case 'top':
          top = rect.top + scrollTop - 120;
          left = rect.left + scrollLeft + rect.width / 2 - 150;
          break;
        case 'bottom':
          top = rect.bottom + scrollTop + 10;
          left = rect.left + scrollLeft + rect.width / 2 - 150;
          break;
        case 'left':
          top = rect.top + scrollTop + rect.height / 2 - 60;
          left = rect.left + scrollLeft - 320;
          break;
        case 'right':
          top = rect.top + scrollTop + rect.height / 2 - 60;
          left = rect.right + scrollLeft + 10;
          break;
      }
      
      setPosition({ top, left });
    }
  }, [targetElement, isVisible, target.placement]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 w-80"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <Card className="p-4 shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ArrowIcon className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">{target.title}</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {target.description}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onDismiss}
                className="text-xs"
              >
                Got it
              </Button>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface CoachMarksProviderProps {
  children: React.ReactNode;
}

export function CoachMarksProvider({ children }: CoachMarksProviderProps) {
  const { currentTarget, dismissCoachMark, targets } = useCoachMarks();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (currentTarget) {
      // Find the target element by data attribute
      const element = document.querySelector(`[data-coach-mark="${currentTarget.key}"]`) as HTMLElement;
      setTargetElement(element);
    } else {
      setTargetElement(null);
    }
  }, [currentTarget]);

  return (
    <>
      {children}
      {currentTarget && (
        <CoachMark
          target={currentTarget}
          isVisible={!!currentTarget}
          onDismiss={dismissCoachMark}
          targetElement={targetElement}
        />
      )}
    </>
  );
}