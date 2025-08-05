import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bluetooth, 
  Download, 
  Play, 
  Upload, 
  Radio, 
  Lock, 
  Brain, 
  Star, 
  ExternalLink 
} from 'lucide-react';

interface FirstTimeUserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstTimeUserGuideModal: React.FC<FirstTimeUserGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();

  const handleClose = () => {
    // Mark user as seen the guide
    localStorage.setItem('meshtv_first_time_guide_seen', 'true');
    onClose();
  };

  const steps = [
    {
      title: "Welcome to Mesh TV Network",
      icon: Radio,
      content: [
        "Watch movies and shows offline — no internet required.",
        "Fully peer-to-peer using Bluetooth Mesh."
      ]
    },
    {
      title: "How to Get Started",
      icon: Bluetooth,
      content: [
        "🔗 Open the app and scan for nearby devices.",
        "📥 Pick a movie or show from the Mesh Library.", 
        "▶️ Hit Play — streaming begins immediately over Bluetooth!"
      ]
    },
    {
      title: "Sharing Content",
      icon: Upload,
      content: [
        "💾 You can upload your favorite movies to the mesh.",
        "📡 They'll sync when others are nearby or when you're online."
      ]
    },
    {
      title: "Using Invite-Only Channels",
      icon: Lock,
      content: [
        "🔐 Private groups let you stream within exclusive mesh zones (schools, events, etc.)",
        "🧪 Enter your invite code or scan a QR to join."
      ]
    },
    {
      title: "Smart Features",
      icon: Brain,
      content: [
        "🧠 AI-curated homepage learns your taste.",
        "⭐ Favorite movies, download offline, or broadcast to others."
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 border-0 bg-transparent overflow-hidden">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-white/10">
            <DialogTitle className="text-2xl font-bold text-white text-center">
              Welcome to Mesh TV Network
            </DialogTitle>
            <p className="text-gray-300 text-center mt-2">
              Your gateway to decentralized entertainment
            </p>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="group">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      {/* Step Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center relative">
                          <IconComponent className="w-6 h-6 text-primary" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          {step.title}
                        </h3>
                        <div className="space-y-2">
                          {step.content.map((item, itemIndex) => (
                            <p key={itemIndex} className="text-gray-300 text-sm leading-relaxed">
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* PDF Guide Link */}
              <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-1">
                      Need more details?
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Download our comprehensive user guide
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => window.open('https://yourdomain.com/Mesh_TV_First_Time_User_Guide.pdf', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Download Guide
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-6 pt-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Button 
                onClick={handleClose}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5 mr-2" />
                Close & Start Watching
              </Button>
              <p className="text-xs text-gray-400 text-center">
                You can access this guide anytime from the settings menu
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage first-time user guide
export const useFirstTimeUserGuide = () => {
  const [showGuide, setShowGuide] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const hasSeenGuide = localStorage.getItem('meshtv_first_time_guide_seen');
      if (!hasSeenGuide) {
        // Small delay to let the app load
        const timer = setTimeout(() => {
          setShowGuide(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const closeGuide = () => {
    setShowGuide(false);
  };

  return { showGuide, closeGuide };
};