import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bluetooth, Globe, Video, Users, Key, Tv } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
export const LiveVideoChat = () => {
  const [fingerprint, setFingerprint] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isHosting, setIsHosting] = useState(false);
  const {
    toast
  } = useToast();
  const handleJoinStream = async () => {
    if (!fingerprint.trim()) {
      toast({
        title: "Missing Fingerprint",
        description: "Please enter a peer's fingerprint to join their stream",
        variant: "destructive"
      });
      return;
    }
    setIsJoining(true);
    try {
      // Simulate joining stream
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Joining Live Stream",
        description: `Connecting to peer: ${fingerprint}`
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to peer. Please check the fingerprint.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };
  const handleHostStream = async () => {
    setIsHosting(true);
    try {
      // Simulate starting host stream
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Live Stream Started",
        description: "Your group live stream is now broadcasting to the mesh network"
      });
    } catch (error) {
      toast({
        title: "Stream Failed",
        description: "Unable to start live stream. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsHosting(false);
    }
  };
  return <Card className="h-full bg-gradient-to-br from-background/90 to-background/50 backdrop-blur-sm border-primary/20">
      <CardContent className="p-6 flex flex-col items-center justify-center h-full space-y-6">
        {/* TV Icon with Globe and Bluetooth */}
        <div className="relative">
          <div className="w-20 h-16 rounded-lg border-4 border-primary bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
            {/* TV Antennas */}
            <div className="absolute -top-4 left-1/4 w-1 h-4 bg-primary rotate-12 rounded-full"></div>
            <div className="absolute -top-4 right-1/4 w-1 h-4 bg-primary -rotate-12 rounded-full"></div>
            <div className="absolute -top-5 left-1/4 w-2 h-2 bg-primary rounded-full"></div>
            <div className="absolute -top-5 right-1/4 w-2 h-2 bg-primary rounded-full"></div>
            
            {/* Globe with Bluetooth */}
            <div className="relative">
              <Globe className="w-8 h-8 text-primary animate-pulse" />
              <Bluetooth className="w-4 h-4 text-accent absolute inset-0 m-auto" />
            </div>
            
            {/* TV Legs */}
            <div className="absolute -bottom-2 left-2 w-1 h-3 bg-primary"></div>
            <div className="absolute -bottom-2 right-2 w-1 h-3 bg-primary"></div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LIVE VIDEO CHAT
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Peer-to-peer live streaming </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
          {/* Join Local Button */}
          <div className="flex flex-col items-center space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="flex flex-col items-center justify-center space-y-2 h-auto py-4 border-primary/50 hover:border-primary hover:bg-primary/10 text-primary hover:text-primary w-full">
                  <Video className="w-5 h-5" />
                  <span className="font-semibold text-xs">Join Local</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Join Local Stream
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Peer Fingerprint</label>
                    <Input placeholder="A1B2-C3D4-E5F6-G7H8" value={fingerprint} onChange={e => setFingerprint(e.target.value)} className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Local mesh peer fingerprint
                    </p>
                  </div>
                  <Button onClick={handleJoinStream} disabled={isJoining} className="w-full">
                    {isJoining ? 'Connecting...' : 'Join Local Stream'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Join Global Button */}
          <div className="flex flex-col items-center space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="flex flex-col items-center justify-center space-y-2 h-auto py-4 border-accent/50 hover:border-accent hover:bg-accent/10 text-accent hover:text-accent w-full">
                  <Globe className="w-5 h-5" />
                  <span className="font-semibold text-xs">Join Global</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Join Global Stream
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Global Peer Fingerprint</label>
                    <Input placeholder="A1B2-C3D4-E5F6-G7H8" value={fingerprint} onChange={e => setFingerprint(e.target.value)} className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Worldwide E2E encrypted connection
                    </p>
                  </div>
                  <Button onClick={handleJoinStream} disabled={isJoining} className="w-full bg-gradient-to-r from-accent to-primary">
                    {isJoining ? 'Connecting Globally...' : 'Join Global Stream'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Host Button */}
          <div className="flex flex-col items-center space-y-2">
            <Button variant="default" size="lg" onClick={handleHostStream} disabled={isHosting} className="flex flex-col items-center justify-center space-y-2 h-auto py-4 bg-gradient-to-r from-primary to-accent hover:shadow-glow w-full">
              <Users className="w-5 h-5" />
              <span className="font-semibold text-xs">Host Live</span>
            </Button>
          </div>
        </div>

        {/* Quick Connect Input */}
        <div className="w-full max-w-md">
          <Input placeholder="Quick connect: paste fingerprint here" value={fingerprint} onChange={e => setFingerprint(e.target.value)} className="text-sm placeholder:text-sm border-primary/50 focus:border-primary bg-background/50 backdrop-blur-sm" onKeyPress={e => {
          if (e.key === 'Enter' && fingerprint.trim()) {
            handleJoinStream();
          }
        }} />
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-background/50">
            <Tv className="w-3 h-3 mr-1" />
            Renkiva Network
          </Badge>
          <span className="text-xs text-muted-foreground">Patent pending</span>
        </div>
      </CardContent>
    </Card>;
};