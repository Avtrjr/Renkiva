import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useShows } from '@/hooks/useShows';
import MeshNetworkStatus from '@/components/MeshNetworkStatus';
import UploadContentForm from '@/components/UploadContentForm';
import ContentUploadGuide from '@/components/ContentUploadGuide';
import { 
  Settings,
  Upload,
  Download,
  Users,
  Wifi,
  Activity,
  TrendingUp,
  Video,
  HardDrive,
  Clock
} from 'lucide-react';

const MeshTVDashboard = () => {
  const { user } = useAuth();
  const { shows, loading } = useShows();
  const [networkStats, setNetworkStats] = useState({
    totalNodes: 12,
    activeNodes: 8,
    totalContent: 156,
    userContent: 3,
    totalViewTime: 2840,
    dataShared: 45.2
  });

  useEffect(() => {
    // Simulate real-time network stats updates
    const interval = setInterval(() => {
      setNetworkStats(prev => ({
        ...prev,
        activeNodes: Math.max(5, prev.activeNodes + Math.floor((Math.random() - 0.5) * 3)),
        totalContent: prev.totalContent + Math.floor(Math.random() * 2),
        totalViewTime: prev.totalViewTime + Math.floor(Math.random() * 30),
        dataShared: Math.max(0, prev.dataShared + (Math.random() - 0.5) * 2)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const userShows = shows.filter(show => show.created_by !== null);
  const publicShows = shows.filter(show => show.created_by === null);

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">MeshTV Dashboard</h1>
          <p className="text-muted-foreground">Monitor your mesh network and manage content</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Nodes</p>
                <p className="text-2xl font-bold text-primary">{networkStats.activeNodes}</p>
              </div>
              <Wifi className="w-8 h-8 text-primary/60" />
            </div>
            <div className="mt-2">
              <Progress value={(networkStats.activeNodes / networkStats.totalNodes) * 100} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">
                {networkStats.activeNodes} of {networkStats.totalNodes} nodes online
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Content</p>
                <p className="text-2xl font-bold text-secondary">{networkStats.totalContent}</p>
              </div>
              <Video className="w-8 h-8 text-secondary/60" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{Math.floor(Math.random() * 5) + 1} this hour
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Shared</p>
                <p className="text-2xl font-bold text-accent">{networkStats.dataShared.toFixed(1)} GB</p>
              </div>
              <HardDrive className="w-8 h-8 text-accent/60" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {(Math.random() * 2 + 0.5).toFixed(1)} MB/s avg
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">View Time</p>
                <p className="text-2xl font-bold text-primary-glow">{Math.floor(networkStats.totalViewTime / 60)}h</p>
              </div>
              <Clock className="w-8 h-8 text-primary-glow/60" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                {networkStats.totalViewTime % 60}m watched today
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Health</CardTitle>
                <CardDescription>Current mesh network status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection Quality</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                      Excellent
                    </Badge>
                  </div>
                  <Progress value={92} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Latency:</span>
                      <span className="ml-2 font-medium">12ms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Throughput:</span>
                      <span className="ml-2 font-medium">48 Mbps</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Content</CardTitle>
                <CardDescription>Content you've shared on the network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uploaded Items</span>
                    <span className="text-2xl font-bold">{userShows.length}</span>
                  </div>
                  
                  {user ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Recent uploads:</div>
                      {userShows.slice(0, 3).map((show) => (
                        <div key={show.id} className="flex items-center gap-2 text-sm">
                          <Video className="w-4 h-4 text-primary" />
                          <span className="truncate">{show.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sign in to upload and track your content
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Network Activity</CardTitle>
              <CardDescription>Latest content and network events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shows.slice(0, 5).map((show) => (
                  <div key={show.id} className="flex items-center gap-3 p-2 rounded border">
                    <Video className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{show.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {show.category} • Added {new Date(show.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {show.created_by ? 'User Upload' : 'Public Library'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <MeshNetworkStatus />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Public Library</CardTitle>
                <CardDescription>{publicShows.length} items available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {publicShows.map((show) => (
                    <div key={show.id} className="flex items-center gap-3 p-2 rounded border">
                      <Video className="w-4 h-4 text-secondary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{show.title}</p>
                        <p className="text-xs text-muted-foreground">{show.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Content</CardTitle>
                <CardDescription>{userShows.length} community uploads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {userShows.map((show) => (
                    <div key={show.id} className="flex items-center gap-3 p-2 rounded border">
                      <Video className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{show.title}</p>
                        <p className="text-xs text-muted-foreground">{show.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadContentForm onUploadComplete={() => window.location.reload()} />
            <ContentUploadGuide />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeshTVDashboard;