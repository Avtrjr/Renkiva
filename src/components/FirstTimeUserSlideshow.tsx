import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bluetooth, 
  Play, 
  Library, 
  Upload, 
  Lock, 
  Brain,
  ArrowRight,
  X
} from 'lucide-react';

interface FirstTimeUserSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstTimeUserSlideshow: React.FC<FirstTimeUserSlideshowProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();

  const slides = [
    {
      title: "Welcome to Mesh TV Network",
      subtitle: "Stream movies & shows offline, without any internet.",
      description: "Fully decentralized, AI-curated, and Bluetooth mesh-powered.",
      icon: Play,
      buttonText: "Get Started"
    },
    {
      title: "Connect to the Mesh",
      subtitle: "Turn on Bluetooth — the app will find nearby devices.",
      description: "You'll join a secure mesh network with instant access to media. No data. No signal. No problem.",
      icon: Bluetooth,
      buttonText: "Next"
    },
    {
      title: "Explore the Library",
      subtitle: "Browse movies & shows shared by others in your mesh.",
      description: "Categories: Sci-Fi, Action, Comedy, Docs, Education. Everything plays instantly — no buffering.",
      icon: Library,
      buttonText: "Next"
    },
    {
      title: "Share Your Content",
      subtitle: "Add your favorite public domain or licensed videos.",
      description: "You can edit the title, category, and description. Shared files broadcast over mesh or sync to cloud when online.",
      icon: Upload,
      buttonText: "Next"
    },
    {
      title: "Private Mesh Channels",
      subtitle: "Invite-only zones for schools, festivals, clubs, and creators.",
      description: "Enter a code or scan a QR to access premium offline libraries.",
      icon: Lock,
      buttonText: "Next"
    },
    {
      title: "Smart, Private & Free",
      subtitle: "AI curates homepage based on your viewing style.",
      description: "Like, download, or favorite shows — all offline. 100% Private. No trackers. No ads — unless you want to share sponsored content.",
      icon: Brain,
      buttonText: "Done – Start Watching"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('meshtv_first_time_slideshow_seen', 'true');
    onClose();
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-full w-full h-full p-0 border-0 bg-transparent overflow-hidden">
        {/* Animated mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--primary))_0%,transparent_50%)] animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent))_0%,transparent_50%)] animate-pulse delay-1000" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,hsl(var(--primary))_0%,transparent_50%)] animate-pulse delay-2000" />
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Skip button */}
          <div className="absolute top-6 right-6 z-20">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Skip
            </Button>
          </div>

          {/* Slides container */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl">
              {/* Slide content with horizontal sliding */}
              <div className="relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {slides.map((slide, index) => {
                    const IconComponent = slide.icon;
                    return (
                      <div key={index} className="w-full flex-shrink-0 text-center px-8">
                        {/* Optional 3D Earth placeholder for first slide */}
                        {index === 0 && (
                          <div className="w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse" />
                          </div>
                        )}
                        
                        {/* Icon for other slides */}
                        {index > 0 && (
                          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <IconComponent className="w-12 h-12 text-primary" />
                          </div>
                        )}

                        {/* Content */}
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                          {slide.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-primary font-medium mb-6 max-w-2xl mx-auto">
                          {slide.subtitle}
                        </p>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                          {slide.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with progress and navigation */}
          <div className="p-8 bg-background/80 backdrop-blur-sm border-t border-border/50">
            {/* Progress bar */}
            <div className="mb-6">
              <Progress value={progress} className="h-2 bg-muted" />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{currentSlide + 1} of {slides.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-center">
              <Button 
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-primary/25"
              >
                {slides[currentSlide].buttonText}
                {currentSlide < slides.length - 1 && (
                  <ArrowRight className="w-5 h-5 ml-2" />
                )}
              </Button>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage first-time user slideshow
export const useFirstTimeUserSlideshow = () => {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const hasSeenSlideshow = localStorage.getItem('meshtv_first_time_slideshow_seen');
      if (!hasSeenSlideshow) {
        // Check if user is truly first-time (created within last 5 minutes)
        const userCreatedAt = new Date(user.created_at);
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        if (userCreatedAt > fiveMinutesAgo) {
          // Small delay to let the app load
          const timer = setTimeout(() => {
            setShowSlideshow(true);
          }, 1500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [user]);

  const closeSlideshow = () => {
    setShowSlideshow(false);
  };

  return { showSlideshow, closeSlideshow };
};