import React, { useState } from 'react';
import { HelpCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelpCenter } from './HelpCenter';
import { StatusLegend } from './StatusLegend';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HelpButtonProps {
  variant?: 'help' | 'status';
  article?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function HelpButton({ 
  variant = 'help', 
  article, 
  className,
  size = 'sm' 
}: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const isStatusButton = variant === 'status';
  const Icon = isStatusButton ? Circle : HelpCircle;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size={size}
            onClick={handleClick}
            className={className}
          >
            <Icon className={`h-4 w-4 ${isStatusButton ? 'text-green-500' : 'text-muted-foreground'}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isStatusButton ? 'Status Legend' : 'Help & Support'}
        </TooltipContent>
      </Tooltip>

      {isStatusButton ? (
        <StatusLegend isOpen={isOpen} onClose={handleClose} />
      ) : (
        <HelpCenter 
          isOpen={isOpen} 
          onClose={handleClose} 
          initialArticle={article}
        />
      )}
    </>
  );
}