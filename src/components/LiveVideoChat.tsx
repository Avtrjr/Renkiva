import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bluetooth, Globe, Video, Users, Key, Tv, Mic, MicOff, VideoOff, Phone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { WebRTCManager } from "@/utils/WebRTCManager";

export const LiveVideoChat = () => {
  const [fingerprint, setFingerprint] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isHosting, setIsHosting] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webRTCManagerRef = useRef<WebRTCManager | null>(null);
  
  const { toast } = useToast();
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (webRTCManagerRef.current) {
        webRTCManagerRef.current.disconnect();
      }
    };
  }, []);

  const handleJoinStream = async () => {
    if (!fingerprint.trim()) {
      toast({
        title: "Missing Channel ID",
        description: "Please enter a channel ID to join",
        variant: "destructive"
      });
      return;
    }
    
    setIsJoining(true);
    try {
      await startVideoChat(fingerprint, false);
      toast({
        title: "Joining Stream",
        description: `Connecting to channel: ${fingerprint}`
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unable to connect. Please check permissions.",
        variant: "destructive"
      });
      setIsJoining(false);
    }
  };

  const handleHostStream = async () => {
    setIsHosting(true);
    const channelId = `room-${Math.random().toString(36).substring(7)}`;
    
    try {
      await startVideoChat(channelId, true);
      setFingerprint(channelId);
      toast({
        title: "Live Stream Started",
        description: `Share this ID: ${channelId}`,
        duration: 10000
      });
    } catch (error) {
      toast({
        title: "Stream Failed",
        description: error instanceof Error ? error.message : "Unable to start stream. Please check permissions.",
        variant: "destructive"
      });
      setIsHosting(false);
    }
  };

  const startVideoChat = async (channelId: string, isHost: boolean) => {
    try {
      webRTCManagerRef.current = new WebRTCManager({
        channelId,
        isHost,
        onRemoteStream: (stream) => {
          console.log('Remote stream received');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        },
        onError: (error) => {
          console.error('WebRTC error:', error);
          toast({
            title: "Connection Error",
            description: error.message,
            variant: "destructive"
          });
        },
        onConnectionStateChange: (state) => {
          console.log('Connection state changed:', state);
          setConnectionState(state);
          
          if (state === 'connected') {
            toast({
              title: "Connected",
              description: "Video call established successfully"
            });
          } else if (state === 'disconnected' || state === 'failed') {
            handleEndCall();
          }
        }
      });

      const localStream = await webRTCManagerRef.current.initialize();
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      
      setIsInCall(true);
      setIsJoining(false);
      setIsHosting(false);
    } catch (error) {
      console.error('Error starting video chat:', error);
      throw error;
    }
  };

  const handleEndCall = async () => {
    if (webRTCManagerRef.current) {
      await webRTCManagerRef.current.disconnect();
      webRTCManagerRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setIsInCall(false);
    setConnectionState('new');
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    
    toast({
      title: "Call Ended",
      description: "Video chat has been disconnected"
    });
  };

  const toggleVideo = () => {
    if (webRTCManagerRef.current) {
      const newState = !isVideoEnabled;
      webRTCManagerRef.current.toggleVideo(newState);
      setIsVideoEnabled(newState);
    }
  };

  const toggleAudio = () => {
    if (webRTCManagerRef.current) {
      const newState = !isAudioEnabled;
      webRTCManagerRef.current.toggleAudio(newState);
      setIsAudioEnabled(newState);
    }
  };
  if (isInCall) {
    return (
      <Card className="h-full bg-gradient-to-br from-background/90 to-background/50 backdrop-blur-sm border-primary/20">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Remote Video */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {connectionState !== 'connected' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Connecting...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              <Badge className="absolute top-2 left-2 bg-primary">You</Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-14 h-14"
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>
            
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14"
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-14 h-14"
            >
              <Phone className="w-6 h-6 rotate-135" />
            </Button>
          </div>

          {/* Channel Info */}
          {fingerprint && (
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">Channel ID</p>
              <p className="text-sm font-mono">{fingerprint}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

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
                    Join Video Call
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Channel ID</label>
                    <Input placeholder="room-abc123" value={fingerprint} onChange={e => setFingerprint(e.target.value)} className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the channel ID shared by the host
                    </p>
                  </div>
                  <Button onClick={handleJoinStream} disabled={isJoining} className="w-full">
                    {isJoining ? 'Connecting...' : 'Join Call'}
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
                    Join Global Call
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Channel ID</label>
                    <Input placeholder="room-abc123" value={fingerprint} onChange={e => setFingerprint(e.target.value)} className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Global peer-to-peer connection
                    </p>
                  </div>
                  <Button onClick={handleJoinStream} disabled={isJoining} className="w-full bg-gradient-to-r from-accent to-primary">
                    {isJoining ? 'Connecting...' : 'Join Global Call'}
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
          <Input placeholder="Quick connect: paste channel ID here" value={fingerprint} onChange={e => setFingerprint(e.target.value)} className="text-sm placeholder:text-sm border-primary/50 focus:border-primary bg-background/50 backdrop-blur-sm" onKeyPress={e => {
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