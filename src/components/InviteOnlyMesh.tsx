import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { QrCode, Scan, Shield, Users, Lock, Star, Ghost, Eye, EyeOff, Copy, Check, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
interface PrivateChannel {
  id: string;
  name: string;
  description: string;
  trustLevel: 'verified' | 'private' | 'anonymous';
  memberCount: number;
  isJoined: boolean;
  qrCode: string;
  inviteCode: string;
  encryptionKey: string;
  lastActivity: Date;
}
interface TrustedPeer {
  fingerprint: string;
  name: string;
  trustLevel: 'verified' | 'private' | 'anonymous';
  addedAt: Date;
  lastSeen?: Date;
}
export function InviteOnlyMesh() {
  const [channels, setChannels] = useState<PrivateChannel[]>([]);
  const [trustedPeers, setTrustedPeers] = useState<TrustedPeer[]>([]);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showStealthMode, setShowStealthMode] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [selectedTrustLevel, setSelectedTrustLevel] = useState<'verified' | 'private' | 'anonymous'>('private');
  useEffect(() => {
    // Initialize with demo channels
    const demoChannels: PrivateChannel[] = [{
      id: 'ch1',
      name: '🎬 Film Enthusiasts',
      description: 'Private channel for sharing classic movies and indie films',
      trustLevel: 'verified',
      memberCount: 12,
      isJoined: true,
      qrCode: 'MESH_INVITE_CH1_VERIFIED_12345',
      inviteCode: 'FILM-VERIFIED-2024',
      encryptionKey: 'aes256_encrypted_key_here',
      lastActivity: new Date(Date.now() - 3600000)
    }, {
      id: 'ch2',
      name: '🔒 Local Network',
      description: 'Neighborhood mesh for local content sharing',
      trustLevel: 'private',
      memberCount: 8,
      isJoined: false,
      qrCode: 'MESH_INVITE_CH2_PRIVATE_67890',
      inviteCode: 'LOCAL-PRIVATE-2024',
      encryptionKey: 'aes256_encrypted_key_here',
      lastActivity: new Date(Date.now() - 1800000)
    }, {
      id: 'ch3',
      name: '👻 Anonymous Drop',
      description: 'Anonymous content sharing with ephemeral sessions',
      trustLevel: 'anonymous',
      memberCount: 25,
      isJoined: false,
      qrCode: 'MESH_INVITE_CH3_ANON_ABCDE',
      inviteCode: 'ANON-DROP-2024',
      encryptionKey: 'ephemeral_session_key',
      lastActivity: new Date(Date.now() - 900000)
    }];
    const demoTrustedPeers: TrustedPeer[] = [{
      fingerprint: 'A1B2-C3D4-E5F6-G7H8',
      name: 'StreamNode-Alpha',
      trustLevel: 'verified',
      addedAt: new Date(Date.now() - 86400000),
      lastSeen: new Date(Date.now() - 3600000)
    }, {
      fingerprint: 'B2C3-D4E5-F6G7-H8I9',
      name: 'MeshRelay-Beta',
      trustLevel: 'private',
      addedAt: new Date(Date.now() - 172800000),
      lastSeen: new Date(Date.now() - 7200000)
    }];
    setChannels(demoChannels);
    setTrustedPeers(demoTrustedPeers);
  }, []);
  const getTrustBadge = (trustLevel: string) => {
    switch (trustLevel) {
      case 'verified':
        return <Badge className="trust-verified"><Star className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'private':
        return <Badge className="trust-private"><Lock className="w-3 h-3 mr-1" />Private</Badge>;
      case 'anonymous':
        return <Badge className="trust-anonymous"><Ghost className="w-3 h-3 mr-1" />Anonymous</Badge>;
      default:
        return null;
    }
  };
  const generateQRCode = (channel: PrivateChannel) => {
    // In a real implementation, this would generate an actual QR code image
    const qrData = {
      type: 'mesh_invite',
      channelId: channel.id,
      inviteCode: channel.inviteCode,
      trustLevel: channel.trustLevel,
      encryptionKey: channel.encryptionKey
    };
    toast.success(`QR Code generated for ${channel.name}`);
    console.log('QR Code data:', qrData);
  };
  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied to clipboard');
  };
  const joinChannel = (channelId: string) => {
    setChannels(prev => prev.map(ch => ch.id === channelId ? {
      ...ch,
      isJoined: true,
      memberCount: ch.memberCount + 1
    } : ch));
    toast.success('Joined private channel');
  };
  const leaveChannel = (channelId: string) => {
    setChannels(prev => prev.map(ch => ch.id === channelId ? {
      ...ch,
      isJoined: false,
      memberCount: Math.max(0, ch.memberCount - 1)
    } : ch));
    toast.info('Left private channel');
  };
  const createChannel = () => {
    if (!newChannelName.trim()) return;
    const newChannel: PrivateChannel = {
      id: `ch_${Date.now()}`,
      name: newChannelName,
      description: newChannelDesc,
      trustLevel: selectedTrustLevel,
      memberCount: 1,
      isJoined: true,
      qrCode: `MESH_INVITE_${Date.now()}_${selectedTrustLevel.toUpperCase()}`,
      inviteCode: `${newChannelName.toUpperCase().replace(/\s+/g, '-')}-${selectedTrustLevel.toUpperCase()}-2024`,
      encryptionKey: 'aes256_new_channel_key',
      lastActivity: new Date()
    };
    setChannels(prev => [newChannel, ...prev]);
    setNewChannelName('');
    setNewChannelDesc('');
    setShowCreateChannel(false);
    toast.success(`Created private channel: ${newChannelName}`);
  };
  const simulateQRScan = () => {
    // Simulate scanning a QR code
    setTimeout(() => {
      const scannedChannel: PrivateChannel = {
        id: 'scanned_ch',
        name: '📱 Scanned Channel',
        description: 'Channel discovered via QR code scan',
        trustLevel: 'verified',
        memberCount: 5,
        isJoined: false,
        qrCode: 'SCANNED_QR_CODE',
        inviteCode: 'SCANNED-VERIFIED-2024',
        encryptionKey: 'scanned_encryption_key',
        lastActivity: new Date()
      };
      setChannels(prev => [scannedChannel, ...prev]);
      setShowQRScanner(false);
      toast.success('Channel discovered via QR scan!');
    }, 2000);
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Renkiva Invite-Only
          </h2>
          <p className="text-muted-foreground">Private channels with end-to-end encryption</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowStealthMode(!showStealthMode)} className={`mesh-button ${showStealthMode ? 'neon-border' : ''}`}>
            {showStealthMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            Stealth Mode
          </Button>
          
          <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mesh-button">
                <Scan className="w-4 h-4 mr-2" />
                Scan QR
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Scan Mesh Invite QR Code</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4">
                <div className="qr-scanner-frame w-64 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Scan className="w-12 h-12 mx-auto mb-2 text-primary animate-pulse" />
                    <p className="text-sm text-muted-foreground">Position QR code in frame</p>
                  </div>
                </div>
                <Button onClick={simulateQRScan} className="mesh-button">
                  Simulate Scan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
            <DialogTrigger asChild>
              <Button className="mesh-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Private Channel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Channel name" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} />
                <Input placeholder="Description (optional)" value={newChannelDesc} onChange={e => setNewChannelDesc(e.target.value)} />
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Trust Level</label>
                  <div className="flex gap-2">
                    {(['verified', 'private', 'anonymous'] as const).map(level => <Button key={level} variant={selectedTrustLevel === level ? "default" : "outline"} size="sm" onClick={() => setSelectedTrustLevel(level)} className="mesh-button">
                        {getTrustBadge(level)}
                      </Button>)}
                  </div>
                </div>
                
                <Button onClick={createChannel} disabled={!newChannelName.trim()} className="w-full mesh-button">
                  Create Channel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Private Channels */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Private Channels ({channels.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map(channel => <Card key={channel.id} className="invite-channel">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{channel.description}</p>
                  </div>
                  {getTrustBadge(channel.trustLevel)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {channel.memberCount} members
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round((Date.now() - channel.lastActivity.getTime()) / 60000)}m ago
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={channel.inviteCode} readOnly className="text-xs font-mono" />
                    <Button size="sm" variant="ghost" onClick={() => copyInviteCode(channel.inviteCode)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => generateQRCode(channel)} className="flex-1 mesh-button">
                      <QrCode className="w-3 h-3 mr-1" />
                      QR Code
                    </Button>
                    
                    {channel.isJoined ? <Button size="sm" variant="destructive" onClick={() => leaveChannel(channel.id)} className="flex-1">
                        <X className="w-3 h-3 mr-1" />
                        Leave
                      </Button> : <Button size="sm" onClick={() => joinChannel(channel.id)} className="flex-1 mesh-button">
                        <Check className="w-3 h-3 mr-1" />
                        Join
                      </Button>}
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* Trusted Peers */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Trusted Peers ({trustedPeers.length})
        </h3>
        
        <div className="space-y-2">
          {trustedPeers.map((peer, index) => <Card key={index} className="mesh-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="mesh-node w-3 h-3 rounded-full bg-primary" />
                    <div>
                      <div className="font-medium">{peer.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {peer.fingerprint}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getTrustBadge(peer.trustLevel)}
                    <span className="text-xs text-muted-foreground">
                      {peer.lastSeen ? `${Math.round((Date.now() - peer.lastSeen.getTime()) / 60000)}m ago` : 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* Manual Invite Input */}
      <Card className="mesh-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Join via Invite Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Enter invite code (e.g., FILM-VERIFIED-2024)" value={inviteCodeInput} onChange={e => setInviteCodeInput(e.target.value)} className="font-mono bg-cyan-950" />
            <Button onClick={() => {
            if (inviteCodeInput.trim()) {
              toast.success('Attempting to join channel...');
              setInviteCodeInput('');
            }
          }} className="mesh-button">
              Join
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}