import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Activity, Users, Tv, Radio, ArrowLeft, RefreshCw, Shield, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import UserManagement from '@/components/admin/UserManagement';

interface DashboardStats {
  total_users: number;
  violations_24h: number;
  activity_24h: number;
  total_shows: number;
  active_nodes: number;
}

interface RateLimitViolation {
  id: string;
  user_id: string | null;
  endpoint: string;
  ip_address: string | null;
  user_agent: string | null;
  violation_count: number;
  created_at: string;
}

interface UserActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: unknown;
  ip_address: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [violations, setViolations] = useState<RateLimitViolation[]>([]);
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminAccess();
    }
  }, [user, authLoading, navigate]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .in('role', ['admin', 'moderator']);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Access denied: Admin or moderator role required');
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error('Failed to verify admin access');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_admin_dashboard_stats');

      if (statsError) throw statsError;
      setStats(statsData as unknown as DashboardStats);

      // Load violations
      const { data: violationsData, error: violationsError } = await supabase
        .from('rate_limit_violations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (violationsError) throw violationsError;
      setViolations(violationsData || []);

      // Load activity logs
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activityError) throw activityError;
      setActivityLogs(activityData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Monitor rate limits and user activity</p>
              </div>
            </div>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.total_users || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rate Limit Violations (24h)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.violations_24h || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Activity (24h)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.activity_24h || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Shows</CardTitle>
              <Tv className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.total_shows || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Nodes</CardTitle>
              <Radio className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.active_nodes || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Violations, Activity, and User Management */}
        <Tabs defaultValue="violations" className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="violations" className="data-[state=active]:bg-background">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Rate Limit Violations
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-background">
              <Activity className="h-4 w-4 mr-2" />
              User Activity
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-background">
              <UserCog className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="violations">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Rate Limit Violations</CardTitle>
              </CardHeader>
              <CardContent>
                {violations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No rate limit violations recorded</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Timestamp</TableHead>
                        <TableHead className="text-muted-foreground">User ID</TableHead>
                        <TableHead className="text-muted-foreground">Endpoint</TableHead>
                        <TableHead className="text-muted-foreground">IP Address</TableHead>
                        <TableHead className="text-muted-foreground">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {violations.map((violation) => (
                        <TableRow key={violation.id} className="border-border">
                          <TableCell className="text-foreground">
                            {format(new Date(violation.created_at), 'MMM d, yyyy HH:mm:ss')}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {violation.user_id ? violation.user_id.slice(0, 8) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-foreground">
                              {violation.endpoint}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {violation.ip_address || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={violation.violation_count > 5 ? 'destructive' : 'secondary'}>
                              {violation.violation_count}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No user activity recorded</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Timestamp</TableHead>
                        <TableHead className="text-muted-foreground">User ID</TableHead>
                        <TableHead className="text-muted-foreground">Action</TableHead>
                        <TableHead className="text-muted-foreground">Resource</TableHead>
                        <TableHead className="text-muted-foreground">IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs.map((log) => (
                        <TableRow key={log.id} className="border-border">
                          <TableCell className="text-foreground">
                            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {log.user_id ? log.user_id.slice(0, 8) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-foreground">
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {log.resource_type ? `${log.resource_type}${log.resource_id ? `: ${log.resource_id.slice(0, 8)}...` : ''}` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {log.ip_address || 'Unknown'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
