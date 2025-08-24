import React, { useState, useEffect } from 'react';
import { HelpCircle, BookOpen, Lightbulb, Settings, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCenter } from './HelpCenter';
import { StatusLegend } from './StatusLegend';
import { QuickStartSheet } from './QuickStartSheet';
import { CoachMarksProvider } from './CoachMarks';
import { useCoachMarks } from '@/hooks/useCoachMarks';

const HELP_QUICK_LINKS = [
  { label: 'Quick Start', article: 'quickstart', icon: Lightbulb },
  { label: 'Verification', article: 'verification', icon: Settings },
  { label: 'Global Mode', article: 'global-mode', icon: Circle },
  { label: 'Safety', article: 'safety-manifests', icon: HelpCircle }
];

export function HelpOnboardingPanel() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<string>();
  const [showFirstTimeHelp, setShowFirstTimeHelp] = useState(false);
  
  const { triggerCoachMarkSequence } = useCoachMarks();

  useEffect(() => {
    // Check if this is a first-time user
    const hasSeenHelp = localStorage.getItem('meshtv-has-seen-help');
    if (!hasSeenHelp) {
      setShowFirstTimeHelp(true);
    }
  }, []);

  const handleHelpClick = (article?: string) => {
    setSelectedArticle(article);
    setHelpOpen(true);
    
    // Mark as seen
    if (showFirstTimeHelp) {
      localStorage.setItem('meshtv-has-seen-help', 'true');
      setShowFirstTimeHelp(false);
    }
  };

  const handleQuickStart = () => {
    setQuickStartOpen(true);
    if (showFirstTimeHelp) {
      localStorage.setItem('meshtv-has-seen-help', 'true');
      setShowFirstTimeHelp(false);
    }
  };

  const handleStartCoachMarks = () => {
    triggerCoachMarkSequence();
  };

  return (
    <CoachMarksProvider>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Help & Onboarding
            {showFirstTimeHelp && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                New
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Start Button */}
          <Button 
            onClick={handleQuickStart}
            className="w-full justify-start"
            variant={showFirstTimeHelp ? "default" : "outline"}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Quick Start Guide
            {showFirstTimeHelp && <Badge className="ml-2 text-xs">Start Here</Badge>}
          </Button>

          {/* Status Legend */}
          <Button 
            onClick={() => setStatusOpen(true)}
            variant="outline"
            className="w-full justify-start"
            data-coach-mark="status-legend"
          >
            <Circle className="h-4 w-4 mr-2 text-green-500" />
            Status Legend
          </Button>

          {/* Coach Marks */}
          <Button 
            onClick={handleStartCoachMarks}
            variant="outline"
            className="w-full justify-start"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Show Feature Tips
          </Button>

          {/* Quick Help Links */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Quick Help</h4>
            {HELP_QUICK_LINKS.map((link) => (
              <Button
                key={link.article}
                variant="ghost"
                size="sm"
                onClick={() => handleHelpClick(link.article)}
                className="w-full justify-start h-8"
              >
                <link.icon className="h-3 w-3 mr-2 text-muted-foreground" />
                <span className="text-xs">{link.label}</span>
              </Button>
            ))}
          </div>

          {/* Main Help Center */}
          <Button 
            onClick={() => handleHelpClick()}
            variant="outline"
            className="w-full"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Open Help Center
          </Button>
        </CardContent>
      </Card>

      {/* Help Modals */}
      <HelpCenter 
        isOpen={helpOpen} 
        onClose={() => setHelpOpen(false)}
        initialArticle={selectedArticle}
      />
      
      <StatusLegend 
        isOpen={statusOpen} 
        onClose={() => setStatusOpen(false)}
      />
      
      <QuickStartSheet 
        isOpen={quickStartOpen} 
        onClose={() => setQuickStartOpen(false)}
      />
    </CoachMarksProvider>
  );
}