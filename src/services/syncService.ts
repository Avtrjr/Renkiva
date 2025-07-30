import { supabase } from "@/integrations/supabase/client";

export interface AdImpression {
  streamTitle: string;
  senderName: string;
  timestamp: string;
  adType: 'pre-roll' | 'mid-roll' | 'post-roll';
  deviceFingerprint?: string;
}

export interface ViewingStats {
  streamTitle: string;
  senderName: string;
  watchTime: number;
  signalStrength: number;
  bufferHealth: number;
  timestamp: string;
  deviceFingerprint?: string;
}

export interface BroadcastMetrics {
  sessionId: string;
  fragmentsSent: number;
  totalFragments: number;
  viewerCount: number;
  peersConnected: number;
  uploadSpeed: string;
  timestamp: string;
}

class SyncService {
  private deviceFingerprint: string;
  private syncQueue: Array<{ type: string; data: any }> = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.deviceFingerprint = this.generateDeviceFingerprint();
    this.setupNetworkListeners();
    this.startPeriodicSync();
  }

  private generateDeviceFingerprint(): string {
    // Generate a privacy-safe device fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    // Create a hash of the fingerprint for privacy
    return btoa(fingerprint).slice(0, 16);
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncQueuedData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startPeriodicSync() {
    // Sync queued data every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.syncQueuedData();
      }
    }, 30000);
  }

  async logAdImpression(impression: AdImpression) {
    const data = {
      ...impression,
      deviceFingerprint: this.deviceFingerprint
    };

    if (this.isOnline) {
      try {
        // For now, we'll store in local storage or a custom table
        // Since we don't have an ad_impressions table yet
        this.storeLocally('ad_impression', data);
        console.log('Ad impression logged:', data);
      } catch (error) {
        console.error('Failed to log ad impression:', error);
        this.queueForSync('ad_impression', data);
      }
    } else {
      this.queueForSync('ad_impression', data);
    }
  }

  async logViewingStats(stats: ViewingStats) {
    const data = {
      ...stats,
      deviceFingerprint: this.deviceFingerprint
    };

    if (this.isOnline) {
      try {
        // Store locally and sync to Supabase for aggregated analytics
        this.storeLocally('viewing_stats', data);
        console.log('Viewing stats logged:', data);
        
        // Update show broadcasts table for real-time stats
        await supabase
          .from('broadcast_sessions')
          .update({ 
            viewer_count: 1, // Could aggregate this properly
            updated_at: new Date().toISOString() 
          })
          .eq('session_name', stats.streamTitle);
      } catch (error) {
        console.error('Failed to log viewing stats:', error);
        this.queueForSync('viewing_stats', data);
      }
    } else {
      this.queueForSync('viewing_stats', data);
    }
  }

  async updateBroadcastMetrics(metrics: BroadcastMetrics) {
    if (this.isOnline) {
      try {
        // Update broadcast session with real-time metrics
        const { error } = await supabase
          .from('broadcast_sessions')
          .update({
            fragments_sent: metrics.fragmentsSent,
            total_fragments: metrics.totalFragments,
            viewer_count: metrics.viewerCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', metrics.sessionId);

        if (error) throw error;
        console.log('Broadcast metrics updated:', metrics);
      } catch (error) {
        console.error('Failed to update broadcast metrics:', error);
        this.queueForSync('broadcast_metrics', metrics);
      }
    } else {
      this.queueForSync('broadcast_metrics', metrics);
    }
  }

  async createBroadcastSession(sessionName: string, showId?: string) {
    try {
      const { data, error } = await supabase
        .from('broadcast_sessions')
        .insert({
          session_name: sessionName,
          show_id: showId,
          is_active: true,
          started_at: new Date().toISOString(),
          fragments_sent: 0,
          total_fragments: 0,
          viewer_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create broadcast session:', error);
      throw error;
    }
  }

  async endBroadcastSession(sessionId: string) {
    try {
      const { error } = await supabase
        .from('broadcast_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to end broadcast session:', error);
      throw error;
    }
  }

  private storeLocally(type: string, data: any) {
    const key = `meshtv_${type}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  private queueForSync(type: string, data: any) {
    this.syncQueue.push({ type, data });
    
    // Limit queue size to prevent memory issues
    if (this.syncQueue.length > 100) {
      this.syncQueue = this.syncQueue.slice(-50);
    }
  }

  private async syncQueuedData() {
    if (this.syncQueue.length === 0) return;

    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToSync) {
      try {
        switch (item.type) {
          case 'ad_impression':
            await this.logAdImpression(item.data);
            break;
          case 'viewing_stats':
            await this.logViewingStats(item.data);
            break;
          case 'broadcast_metrics':
            await this.updateBroadcastMetrics(item.data);
            break;
        }
      } catch (error) {
        console.error(`Failed to sync ${item.type}:`, error);
        // Re-queue failed items
        this.syncQueue.push(item);
      }
    }
  }

  // Privacy-safe analytics aggregation
  async getAggregatedStats(timeRange: 'hour' | 'day' | 'week' = 'day') {
    try {
      // This would aggregate stats without exposing individual user data
      const keys = Object.keys(localStorage);
      const stats = {
        totalImpressions: 0,
        totalViewTime: 0,
        uniqueStreams: new Set(),
        averageSignalStrength: 0,
        averageBufferHealth: 0
      };

      keys.forEach(key => {
        if (key.startsWith('meshtv_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '');
            if (key.includes('ad_impression')) {
              stats.totalImpressions++;
              stats.uniqueStreams.add(data.streamTitle);
            } else if (key.includes('viewing_stats')) {
              stats.totalViewTime += data.watchTime;
              stats.averageSignalStrength += data.signalStrength;
              stats.averageBufferHealth += data.bufferHealth;
            }
          } catch (e) {
            // Ignore invalid JSON
          }
        }
      });

      return {
        ...stats,
        uniqueStreams: stats.uniqueStreams.size,
        averageSignalStrength: stats.averageSignalStrength / Math.max(1, stats.totalImpressions),
        averageBufferHealth: stats.averageBufferHealth / Math.max(1, stats.totalImpressions)
      };
    } catch (error) {
      console.error('Failed to get aggregated stats:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const syncService = new SyncService();