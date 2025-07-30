import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  X, 
  Heart, 
  DollarSign, 
  Gift, 
  Star,
  ExternalLink,
  Coffee
} from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  message: string;
  url: string;
  amount: number;
}

export function SponsorshipOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);
  const [showDonation, setShowDonation] = useState(false);

  const sponsors: Sponsor[] = [
    {
      id: '1',
      name: 'TechMesh Solutions',
      logo: '🌐',
      tier: 'platinum',
      message: 'Supporting decentralized streaming technology',
      url: 'https://example.com',
      amount: 1000
    },
    {
      id: '2', 
      name: 'PrivacyFirst VPN',
      logo: '🔒',
      tier: 'gold',
      message: 'Protecting your mesh network privacy',
      url: 'https://example.com',
      amount: 500
    },
    {
      id: '3',
      name: 'StreamFlow Media',
      logo: '📺',
      tier: 'silver',
      message: 'Empowering content creators worldwide',
      url: 'https://example.com',
      amount: 250
    }
  ];

  useEffect(() => {
    // Show sponsorship overlay periodically
    const showOverlay = () => {
      if (Math.random() < 0.3) { // 30% chance
        const randomSponsor = sponsors[Math.floor(Math.random() * sponsors.length)];
        setCurrentSponsor(randomSponsor);
        setIsVisible(true);
      }
    };

    // Show after initial delay and then periodically
    const initialTimer = setTimeout(showOverlay, 10000); // 10 seconds
    const intervalTimer = setInterval(showOverlay, 120000); // Every 2 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'text-purple-400 border-purple-400';
      case 'gold': return 'text-yellow-400 border-yellow-400';
      case 'silver': return 'text-gray-400 border-gray-400';
      case 'bronze': return 'text-orange-400 border-orange-400';
      default: return 'text-muted-foreground border-border';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '⭐';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-medium">Sponsored Message</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {currentSponsor && !showDonation && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{currentSponsor.logo}</div>
                <h3 className="font-bold text-lg">{currentSponsor.name}</h3>
                <Badge className={`text-xs ${getTierColor(currentSponsor.tier)}`}>
                  {getTierIcon(currentSponsor.tier)} {currentSponsor.tier.toUpperCase()} Sponsor
                </Badge>
              </div>

              <p className="text-center text-muted-foreground text-sm">
                {currentSponsor.message}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => window.open(currentSponsor.url, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Sponsor
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDonation(true)}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Support Us
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                This message helps keep MeshTV free and decentralized
              </p>
            </div>
          )}

          {showDonation && (
            <div className="space-y-4">
              <div className="text-center">
                <Coffee className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold text-lg">Support MeshTV</h3>
                <p className="text-sm text-muted-foreground">
                  Help us maintain the decentralized streaming network
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 25].map((amount) => (
                  <Button
                    key={amount}
                    size="sm"
                    variant="outline"
                    className="flex flex-col py-3 h-auto"
                  >
                    <DollarSign className="w-4 h-4 mb-1" />
                    <span>${amount}</span>
                  </Button>
                ))}
              </div>

              <Button size="sm" className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Support Development
              </Button>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDonation(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}