import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { reportManager, ContentReport, ReportStatus, ReportReason, ReportUtils } from '@/security/report/ReportManager';
import { bulletinStore, BulletinType, BulletinUtils } from '@/security/bulletin/ModerationBulletin';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Ban, UserX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function ModeratorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication and moderator role
  useEffect(() => {
    const checkModeratorAccess = async () => {
      if (!user) {
        setCheckingAuth(false);
        toast({
          title: "Authentication Required",
          description: "Please log in to access the moderator dashboard.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      try {
        // Check if user has moderator or admin role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['moderator', 'admin'])
          .maybeSingle();

        if (error) {
          console.error('Error checking moderator role:', error);
          setIsModerator(false);
        } else if (data) {
          setIsModerator(true);
        } else {
          setIsModerator(false);
          toast({
            title: "Access Denied",
            description: "You do not have moderator permissions.",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking moderator access:', error);
        setIsModerator(false);
        navigate('/');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkModeratorAccess();
  }, [user, navigate, toast]);

  useEffect(() => {
    if (isModerator && !checkingAuth) {
      loadData();
    }
  }, [isModerator, checkingAuth]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reportsData, bulletinsData] = await Promise.all([
        reportManager.getReports(),
        bulletinStore.list()
      ]);
      setReports(reportsData);
      setBulletins(bulletinsData);
    } catch (error) {
      console.error('Failed to load moderator data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'confirm' | 'dismiss' | 'escalate') => {
    try {
      let status: ReportStatus;
      let notes = '';

      switch (action) {
        case 'confirm':
          status = ReportStatus.CONFIRMED;
          notes = 'Report confirmed - content blocked';
          break;
        case 'dismiss':
          status = ReportStatus.DISMISSED;
          notes = 'Report dismissed - no violation found';
          break;
        case 'escalate':
          status = ReportStatus.ESCALATED;
          notes = 'Report escalated for senior review';
          break;
      }

      await reportManager.updateReportStatus(reportId, status, notes);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to update report:', error);
    }
  };

  const createHashBlockBulletin = async (report: ContentReport) => {
    try {
      const bulletin = BulletinUtils.createHashBlockBulletin(
        report.evidence.contentHash,
        [`User report: ${ReportUtils.getReasonDisplayName(report.reason)}`]
      );

      // In production, this would require proper moderator signatures
      const bulletinWithSigs = { ...bulletin, signatures: [] };
      await bulletinStore.add(bulletinWithSigs);
      
      await handleReportAction(report.id, 'confirm');
    } catch (error) {
      console.error('Failed to create hash block bulletin:', error);
    }
  };

  const createOriginRevokeBulletin = async (report: ContentReport) => {
    try {
      const bulletin = BulletinUtils.createOriginRevokeBulletin(
        report.evidence.manifest.originPubKey,
        [`Multiple violations from origin`, `Report: ${ReportUtils.getReasonDisplayName(report.reason)}`]
      );

      const bulletinWithSigs = { ...bulletin, signatures: [] };
      await bulletinStore.add(bulletinWithSigs);
      
      await handleReportAction(report.id, 'confirm');
    } catch (error) {
      console.error('Failed to create origin revoke bulletin:', error);
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case ReportStatus.UNDER_REVIEW:
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case ReportStatus.CONFIRMED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case ReportStatus.DISMISSED:
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case ReportStatus.ESCALATED:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getBulletinIcon = (type: BulletinType) => {
    return type === BulletinType.HASH_BLOCK ? 
      <Ban className="w-4 h-4 text-red-500" /> :
      <UserX className="w-4 h-4 text-orange-500" />;
  };

  if (checkingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">
            {checkingAuth ? 'Verifying access...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isModerator) {
    return null; // Navigation to home page handled in useEffect
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Moderator Dashboard</h1>
          <p className="text-muted-foreground">Review reports and manage content safety</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reports</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === ReportStatus.PENDING).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === ReportStatus.UNDER_REVIEW).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Bulletins</p>
                <p className="text-2xl font-bold">{bulletins.length}</p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => 
                    r.resolvedAt && 
                    Date.now() - r.resolvedAt < 24 * 60 * 60 * 1000
                  ).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Content Reports</TabsTrigger>
          <TabsTrigger value="bulletins">Active Bulletins</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Reports</h3>
                <p className="text-muted-foreground">All clear! No content reports to review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(report.status)}
                          <Badge variant="outline">
                            {ReportUtils.getReasonDisplayName(report.reason)}
                          </Badge>
                          <Badge variant="secondary">{report.status}</Badge>
                        </div>
                        
                        <p className="text-sm mb-2">{report.description}</p>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Content Hash: {Array.from(report.evidence.contentHash.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('')}...</div>
                          <div>NSFW Score: {report.evidence.manifest.nsfwScore.toFixed(3)}</div>
                          <div>Reported: {new Date(report.reportedAt).toLocaleString()}</div>
                        </div>
                      </div>

                      {report.status === ReportStatus.PENDING && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => createHashBlockBulletin(report)}
                          >
                            Block Hash
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => createOriginRevokeBulletin(report)}
                          >
                            Revoke Origin
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReportAction(report.id, 'dismiss')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bulletins" className="space-y-4">
          {bulletins.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Ban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Bulletins</h3>
                <p className="text-muted-foreground">No content is currently blocked by moderation bulletins.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bulletins.map((bulletin) => (
                <Card key={bulletin.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getBulletinIcon(bulletin.type)}
                          <Badge variant={bulletin.type === BulletinType.HASH_BLOCK ? 'destructive' : 'default'}>
                            {bulletin.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <div>Subject: {Array.from(bulletin.subject.slice(0, 8)).map((b: number) => b.toString(16).padStart(2, '0')).join('')}...</div>
                          <div>Reasons: {bulletin.reasons.join(', ')}</div>
                          <div>Expires: {new Date(bulletin.expiresAt).toLocaleString()}</div>
                          <div>Signatures: {bulletin.signatures.length}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}