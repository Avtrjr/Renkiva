import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  Lock, 
  Eye, 
  Plus, 
  QrCode, 
  Copy, 
  Users, 
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Video
} from 'lucide-react';
import { useToast } from './ui/use-toast';
import { encryptionService, type PrivateChannel, type EncryptedInvite } from '../services/encryptionService';

// Channel Video Upload Component
function ChannelVideoUpload({ channelId, channelName }: { channelId: string, channelName: string }) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleVideoUpload = async () => {
    if (!videoFile || !title.trim()) {
      toast({
        title: "Missing Info",
        description: "Please select a video file and enter a title.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Video Uploaded!",
        description: `"${title}" has been uploaded to ${channelName} channel.`,
      });
      
      // Reset form
      setVideoFile(null);
      setTitle('');
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-accent/30 rounded-lg p-4">
        {!videoFile ? (
          <div className="text-center space-y-2">
            <Video className="w-8 h-8 mx-auto text-accent opacity-60" />
            <p className="text-sm text-muted-foreground">Upload funny videos to share with channel members</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => document.getElementById('channel-video-upload')?.click()}
            >
              Choose Video File
            </Button>
            <input
              id="channel-video-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setVideoFile(file);
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{videoFile.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setVideoFile(null)}
              >
                ✕
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {videoFile && (
        <div className="space-y-2">
          <Input
            placeholder="Video title (e.g., 'Hilarious Cat Compilation')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button
            onClick={handleVideoUpload}
            disabled={uploading || !title.trim()}
            size="sm"
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload to Channel'}
          </Button>
        </div>
      )}
    </div>
  );
}

export function PrivateChannelManager() {
  const [channels, setChannels] = useState<PrivateChannel[]>([]);
  const [invites, setInvites] = useState<EncryptedInvite[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<PrivateChannel | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    trustLevel: 'private' as 'verified' | 'private' | 'anonymous'
  });
  const [newInvite, setNewInvite] = useState({
    maxUses: 10,
    expirationHours: 24
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedChannels = encryptionService.getChannels();
    const loadedInvites = encryptionService.getInvites();
    console.log('Loaded channels:', loadedChannels);
    console.log('Loaded invites:', loadedInvites);
    setChannels(loadedChannels);
    setInvites(loadedInvites);
  };

  const handleCreateChannel = async () => {
    if (!newChannel.name.trim()) return;

    try {
      const channel = await encryptionService.createPrivateChannel(
        newChannel.name,
        newChannel.description,
        newChannel.trustLevel
      );
      
      loadData();
      setShowCreateForm(false);
      setNewChannel({ name: '', description: '', trustLevel: 'private' });
      
      toast({
        title: "Channel Created",
        description: `Private channel "${channel.name}" has been created with ${channel.trustLevel} encryption.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateInvite = async () => {
    if (!selectedChannel) return;

    try {
      const inviteCode = await encryptionService.createInvite(
        selectedChannel.id,
        newInvite.maxUses,
        newInvite.expirationHours
      );
      
      loadData();
      setShowInviteForm(false);
      setNewInvite({ maxUses: 10, expirationHours: 24 });
      
      // Copy to clipboard
      navigator.clipboard.writeText(inviteCode);
      
      toast({
        title: "Invite Created",
        description: `Invite code "${inviteCode}" copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invite. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinChannel = async () => {
    if (!joinCode.trim()) return;

    try {
      const result = await encryptionService.useInvite(joinCode.trim());
      
      if (result.success && result.channel) {
        loadData();
        setJoinCode('');
        
        // Switch to channels tab to show the newly joined channel
        const tabsList = document.querySelector('[data-value="channels"]') as HTMLElement;
        if (tabsList) {
          tabsList.click();
        }
        
        toast({
          title: "Channel Joined Successfully!",
          description: `Welcome to "${result.channel.name}". You can now access this private channel.`,
        });
      } else {
        toast({
          title: "Invalid Invite Code",
          description: result.error || "Please check your invite code and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to join channel. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: `Invite code "${code}" copied to clipboard.`,
    });
  };

  const getTrustBadgeVariant = (trustLevel: string) => {
    switch (trustLevel) {
      case 'verified': return 'default';
      case 'private': return 'secondary';
      case 'anonymous': return 'outline';
      default: return 'outline';
    }
  };

  const getTrustIcon = (trustLevel: string) => {
    switch (trustLevel) {
      case 'verified': return '⭐';
      case 'private': return '🔒';
      case 'anonymous': return '👻';
      default: return '🔒';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className="private-channel-manager">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Private Channels & Encrypted Invites
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
          </TabsList>
          
          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Your Private Channels</h3>
                <p className="text-xs text-muted-foreground">Click on a channel to access it and manage invites</p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="mesh-button"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Channel
              </Button>
            </div>

            {showCreateForm && (
              <Card className="p-4 space-y-3">
                <Input
                  placeholder="Channel name"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                />
                <Textarea
                  placeholder="Channel description (optional)"
                  value={newChannel.description}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[60px]"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Trust Level:</span>
                  {(['verified', 'private', 'anonymous'] as const).map((level) => (
                    <Badge
                      key={level}
                      variant={newChannel.trustLevel === level ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setNewChannel(prev => ({ ...prev, trustLevel: level }))}
                    >
                      {getTrustIcon(level)} {level}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateChannel} size="sm">Create</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)} size="sm">
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            <div className="space-y-3">
              {channels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No private channels available</p>
                  <p className="text-xs mb-4">To access private channels, you can:</p>
                  <div className="space-y-2 text-xs">
                    <p>• Create a new channel using the "Create Channel" button above</p>
                    <p>• Join an existing channel using an invite code in the "Join" tab</p>
                    <p>• Wait for someone to invite you to their private channel</p>
                  </div>
                </div>
              ) : (
                channels.map((channel) => (
                  <Card 
                    key={channel.id}
                    className={`p-3 transition-colors hover:bg-accent/50 ${
                      selectedChannel?.id === channel.id ? 'border-primary bg-primary/5' : 'border-border/50'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Channel Header */}
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => {
                          setSelectedChannel(channel);
                          toast({
                            title: "Channel Selected",
                            description: `You can now access "${channel.name}" and create invites for others.`,
                          });
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{channel.name}</h4>
                            <Badge variant={getTrustBadgeVariant(channel.trustLevel)} className="text-xs">
                              {getTrustIcon(channel.trustLevel)}
                            </Badge>
                            {channel.isInviteOnly && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                Invite Only
                              </Badge>
                            )}
                          </div>
                          {channel.description && (
                            <p className="text-xs text-muted-foreground mb-2">{channel.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {channel.memberCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {formatTimeAgo(channel.lastActivity)}
                            </span>
                          </div>
                        </div>
                        
                        {selectedChannel?.id === channel.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowInviteForm(true);
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Invite
                          </Button>
                        )}
                      </div>

                      {/* Video Upload Section for Each Channel */}
                      <div className="border-t border-border/30 pt-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Video className="w-4 h-4 text-accent" />
                          <h5 className="text-xs font-medium text-muted-foreground">Upload Funny Videos</h5>
                        </div>
                        <ChannelVideoUpload 
                          channelId={channel.id} 
                          channelName={channel.name}
                        />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {showInviteForm && selectedChannel && (
              <Card className="p-4 space-y-3">
                <h4 className="font-medium text-sm">Create Invite for "{selectedChannel.name}"</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Max Uses</label>
                    <Input
                      type="number"
                      value={newInvite.maxUses}
                      onChange={(e) => setNewInvite(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 1 }))}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Expires (hours)</label>
                    <Input
                      type="number"
                      value={newInvite.expirationHours}
                      onChange={(e) => setNewInvite(prev => ({ ...prev, expirationHours: parseInt(e.target.value) || 1 }))}
                      min="1"
                      max="168"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateInvite} size="sm">Create Invite</Button>
                  <Button variant="outline" onClick={() => setShowInviteForm(false)} size="sm">
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

          </TabsContent>
          
          {/* Invites Tab */}
          <TabsContent value="invites" className="space-y-4">
            <h3 className="text-sm font-medium">Active Invites</h3>
            <div className="space-y-3">
              {invites.map((invite) => {
                const channel = encryptionService.getChannelById(invite.channelId);
                const isExpired = invite.expiresAt < new Date();
                const isExhausted = invite.currentUses >= invite.maxUses;
                
                return (
                  <Card key={invite.inviteCode} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {invite.inviteCode}
                          </code>
                          <Badge variant={getTrustBadgeVariant(invite.trustLevel)} className="text-xs">
                            {getTrustIcon(invite.trustLevel)}
                          </Badge>
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Expired
                            </Badge>
                          )}
                          {isExhausted && (
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Full
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          Channel: {channel?.name || 'Unknown'}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{invite.currentUses}/{invite.maxUses} uses</span>
                          <span>Expires: {invite.expiresAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyInviteCode(invite.inviteCode)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // In a real app, this would show the QR code
                            toast({
                              title: "QR Code",
                              description: "QR code generated for invite sharing.",
                            });
                          }}
                        >
                          <QrCode className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          {/* Join Tab */}
          <TabsContent value="join" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Join Private Channel</h3>
              <p className="text-xs text-muted-foreground">
                Enter an invite code to join an encrypted private channel.
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter invite code (e.g., VER-ABC12345)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="font-mono"
                />
                <Button onClick={handleJoinChannel} disabled={!joinCode.trim()}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Join
                </Button>
              </div>
              
              <div className="border border-border/50 rounded-lg p-3">
                <h4 className="text-xs font-medium mb-2">Security Notice</h4>
                <p className="text-xs text-muted-foreground">
                  All communications in private channels are end-to-end encrypted. 
                  Only invited members can access channel content and metadata.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}