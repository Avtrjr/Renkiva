import { useEffect, useState } from 'react';
import { syncService } from '@/services/syncService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Eye, Clock, Signal } from 'lucide-react';

interface AdTrackerProps {
  className?: string;
}

const AdTracker = ({ className }: AdTrackerProps) => {
  const [stats, setStats] = useState({
    totalImpressions: 0,
    totalViewTime: 0,
    uniqueStreams: 0,
    averageSignalStrength: 0,
    averageBufferHealth: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const aggregatedStats = await syncService.getAggregatedStats();
      if (aggregatedStats) {
        setStats(aggregatedStats);
      }
    };

    // Load initial stats
    loadStats();

    // Refresh stats every minute
    const interval = setInterval(loadStats, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatViewTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className={`bg-card/80 backdrop-blur-lg border-border/50 shadow-clay ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Analytics Overview
          <Badge variant="outline" className="text-xs">
            Privacy-Safe
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Impressions */}
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Ad Impressions</p>
              <p className="text-xs text-muted-foreground">Total served</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{stats.totalImpressions}</p>
          </div>
        </div>

        {/* View Time */}
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Total View Time</p>
              <p className="text-xs text-muted-foreground">Across all streams</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{formatViewTime(stats.totalViewTime)}</p>
          </div>
        </div>

        {/* Network Health */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Signal className="w-3 h-3 text-primary" />
              <p className="text-xs font-medium">Avg Signal</p>
            </div>
            <p className="text-sm font-bold">{stats.averageSignalStrength.toFixed(0)}%</p>
          </div>
          
          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <p className="text-xs font-medium">Streams</p>
            </div>
            <p className="text-sm font-bold">{stats.uniqueStreams}</p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            📡 All data is anonymized and stored locally for privacy protection
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdTracker;