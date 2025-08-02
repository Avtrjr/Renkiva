import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Shield, Users, Wifi, Lock, Unlock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JoinChannelProps {
  onChannelJoined?: (channelData: any) => void;
  deviceId?: string;
}

export default function JoinPrivateChannel({ onChannelJoined, deviceId = 'device-' + Math.random().toString(36).substr(2, 9) }: JoinChannelProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [channelData, setChannelData] = useState<any>(null);
  const [peerCount] = useState(Math.floor(Math.random() * 20) + 5);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-focus input on load
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const formatInviteCode = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Add dashes every 4 characters
    return cleaned.replace(/(.{4})/g, '$1-').replace(/-$/, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInviteCode(e.target.value);
    setInviteCode(formatted);
    setError(''); // Clear error when user starts typing
  };

  const handleJoinChannel = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting to join channel with code:', inviteCode);
      
      const { data, error: functionError } = await supabase.functions.invoke('join-channel', {
        body: {
          invite_code: inviteCode.replace(/-/g, ''), // Remove dashes for API call
          device_id: deviceId
        }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        setError('Failed to connect to channel service');
        return;
      }

      if (data.error) {
        console.error('Channel join error:', data.error);
        // Map API errors to user-friendly messages
        switch (data.error) {
          case 'Invalid invite code':
            setError('❌ Invalid invite code');
            break;
          case 'Invite has expired':
            setError('⚠️ This code has expired');
            break;
          case 'Invite has reached maximum usage limit':
            setError('🚫 Invite limit reached');
            break;
          default:
            setError('❌ ' + data.error);
        }
        return;
      }

      // Success!
      console.log('Successfully joined channel:', data);
      setChannelData(data);
      setSuccess(true);
      
      toast({
        title: "✅ Channel Joined!",
        description: `Welcome to ${data.channel_name || 'Private Channel'}`,
      });

      // Auto-transition after 2 seconds
      setTimeout(() => {
        if (onChannelJoined) {
          onChannelJoined(data);
        }
      }, 2000);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('❌ Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinChannel();
    }
  };

  if (success && channelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-lg border-b border-border/30 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Mesh TV Network
              </h1>
              <p className="text-muted-foreground">Stream Offline. No Internet Needed.</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              {peerCount} Devices
            </Badge>
          </div>
        </header>

        {/* Success Content */}
        <main className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-2xl bg-card/60 backdrop-blur-lg border-border/30 shadow-mesh-glow animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">🎉 Welcome to the Mesh!</CardTitle>
              <p className="text-muted-foreground">
                You've successfully joined <strong>{channelData.channel_name || 'Private Channel'}</strong>
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Channel Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Encrypted</p>
                  <p className="text-xs text-muted-foreground">End-to-end security</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{peerCount} Peers</p>
                  <p className="text-xs text-muted-foreground">Connected devices</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Wifi className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Offline Ready</p>
                  <p className="text-xs text-muted-foreground">No internet needed</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Transitioning to channel dashboard...
                </p>
                <div className="w-8 h-8 mx-auto">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border/30 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Mesh TV Network
          </h1>
          <p className="text-muted-foreground">Stream Offline. No Internet Needed.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-card/60 backdrop-blur-lg border-border/30 shadow-mesh-glow">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">🔐 Enter Your Invite Code</CardTitle>
            <p className="text-sm text-muted-foreground">
              Private channels are encrypted and offline-ready.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="e.g. 8JK3-P7V9-X3Q2"
                value={inviteCode}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={`text-center text-lg tracking-wider font-mono transition-all duration-200 ${
                  error ? 'border-destructive animate-pulse' : 'focus:shadow-mesh-glow'
                }`}
                maxLength={19} // Allow for dashes
                disabled={isLoading}
              />
              
              {error && (
                <div className="text-sm text-destructive text-center animate-fade-in">
                  {error}
                </div>
              )}
            </div>

            <Button
              onClick={handleJoinChannel}
              disabled={isLoading || !inviteCode.trim()}
              className="w-full text-lg py-6 shadow-mesh-glow hover:scale-105 transition-all duration-200"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Unlock className="h-5 w-5 mr-2" />
                  🔓 Join Channel
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="ghost" size="sm">
            Create Private Channel
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                What's a Mesh Channel?
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Mesh Channels Explained
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p>
                  <strong>Mesh channels</strong> are private, encrypted spaces where devices 
                  can share content directly without internet connection.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span>End-to-end encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-primary" />
                    <span>Works completely offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Device-to-device sharing</span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Perfect for private events, remote areas, or when you want 
                  complete privacy and control over your content.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </footer>
    </div>
  );
}