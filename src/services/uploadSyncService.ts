import { supabase } from "@/integrations/supabase/client";

interface UploadQueueItem {
  id: string;
  file: File;
  metadata: {
    title: string;
    category: string;
    description: string;
  };
  fingerprint: string;
  fragments: any[];
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'paused';
  progress: number;
  retryCount: number;
  lastAttempt?: Date;
  error?: string;
}

interface SyncStats {
  totalUploads: number;
  completedUploads: number;
  failedUploads: number;
  pendingUploads: number;
  totalRetries: number;
  avgUploadTime: number;
  lastSyncTime?: Date;
  isOnline: boolean;
}

export class UploadSyncService {
  private uploadQueue: Map<string, UploadQueueItem> = new Map();
  private syncCallbacks: ((stats: SyncStats) => void)[] = [];
  private queueCallbacks: ((queue: UploadQueueItem[]) => void)[] = [];
  private isOnline = navigator.onLine;
  private isSyncing = false;
  private syncInterval?: NodeJS.Timeout;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    // Load existing queue from localStorage
    this.loadQueueFromStorage();
    
    // Set up network monitoring
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Start periodic sync when online
    if (this.isOnline) {
      this.startPeriodicSync();
    }
  }

  private loadQueueFromStorage() {
    try {
      const storedQueue = localStorage.getItem('meshplay_upload_queue');
      if (storedQueue) {
        const queueData = JSON.parse(storedQueue);
        queueData.forEach((item: any) => {
          // Reconstruct File objects cannot be stored in localStorage, 
          // so we'll mark these as 'paused' and require re-selection
          if (item.status === 'uploading') {
            item.status = 'paused';
            item.error = 'Upload interrupted - please re-select file';
          }
          this.uploadQueue.set(item.id, item);
        });
        console.log(`📦 Loaded ${this.uploadQueue.size} items from upload queue`);
      }
    } catch (error) {
      console.error('Error loading upload queue:', error);
    }
  }

  private saveQueueToStorage() {
    try {
      const queueArray = Array.from(this.uploadQueue.values()).map(item => ({
        ...item,
        file: null // Don't store File objects
      }));
      localStorage.setItem('meshplay_upload_queue', JSON.stringify(queueArray));
    } catch (error) {
      console.error('Error saving upload queue:', error);
    }
  }

  private handleOnline() {
    console.log('🌐 Network connection restored');
    this.isOnline = true;
    this.startPeriodicSync();
    this.notifySyncCallbacks();
  }

  private handleOffline() {
    console.log('📴 Network connection lost');
    this.isOnline = false;
    this.stopPeriodicSync();
    this.notifySyncCallbacks();
  }

  private startPeriodicSync() {
    if (this.syncInterval) return;
    
    this.syncInterval = setInterval(() => {
      this.processPendingUploads();
    }, 10000); // Sync every 10 seconds
    
    // Initial sync
    this.processPendingUploads();
  }

  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  async addToQueue(
    file: File, 
    metadata: UploadQueueItem['metadata'], 
    fingerprint: string, 
    fragments: any[]
  ): Promise<string> {
    const queueItem: UploadQueueItem = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      file,
      metadata,
      fingerprint,
      fragments,
      status: 'pending',
      progress: 0,
      retryCount: 0,
      lastAttempt: new Date()
    };

    this.uploadQueue.set(queueItem.id, queueItem);
    this.saveQueueToStorage();
    this.notifyQueueCallbacks();
    
    console.log(`➕ Added to upload queue: ${metadata.title}`);
    
    // Try immediate upload if online
    if (this.isOnline) {
      this.processUpload(queueItem.id);
    }

    return queueItem.id;
  }

  private async processPendingUploads() {
    if (!this.isOnline || this.isSyncing) return;

    const pendingItems = Array.from(this.uploadQueue.values())
      .filter(item => 
        item.status === 'pending' || 
        (item.status === 'failed' && item.retryCount < this.maxRetries)
      );

    if (pendingItems.length === 0) return;

    console.log(`🔄 Processing ${pendingItems.length} pending uploads`);
    
    for (const item of pendingItems.slice(0, 3)) { // Process max 3 at a time
      await this.processUpload(item.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
  }

  private async processUpload(uploadId: string): Promise<void> {
    const item = this.uploadQueue.get(uploadId);
    if (!item || item.status === 'uploading' || item.status === 'completed') return;

    if (item.status === 'failed' && item.retryCount >= this.maxRetries) {
      console.log(`❌ Max retries reached for ${item.metadata.title}`);
      return;
    }

    try {
      // Update status
      item.status = 'uploading';
      item.lastAttempt = new Date();
      this.notifyQueueCallbacks();

      console.log(`⬆️ Starting upload: ${item.metadata.title} (attempt ${item.retryCount + 1})`);

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        item.progress = progress;
        this.notifyQueueCallbacks();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Upload to Supabase
      const { data, error } = await supabase
        .from('shows')
        .insert({
          title: item.metadata.title,
          category: item.metadata.category,
          description: item.metadata.description,
          is_public: true,
          video_url: `mesh://${item.fingerprint}`,
          file_size_bytes: item.file.size,
          duration_minutes: Math.floor(Math.random() * 120 + 30) // Mock duration
        });

      if (error) throw error;

      // Mark as completed
      item.status = 'completed';
      item.progress = 100;
      item.error = undefined;
      
      console.log(`✅ Upload completed: ${item.metadata.title}`);
      
      // Store in favorites/verified content
      await this.markAsVerified(item.fingerprint, item.metadata);

    } catch (error) {
      console.error(`❌ Upload failed: ${item.metadata.title}`, error);
      
      item.status = 'failed';
      item.retryCount++;
      item.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Schedule retry if under max attempts
      if (item.retryCount < this.maxRetries) {
        setTimeout(() => {
          if (this.isOnline) {
            this.processUpload(uploadId);
          }
        }, this.retryDelay * item.retryCount); // Exponential backoff
      }
    }

    this.saveQueueToStorage();
    this.notifyQueueCallbacks();
    this.notifySyncCallbacks();
  }

  private async markAsVerified(fingerprint: string, metadata: UploadQueueItem['metadata']) {
    try {
      // Store in local verified content cache
      const verifiedContent = JSON.parse(localStorage.getItem('meshplay_verified_content') || '[]');
      
      const verifiedItem = {
        fingerprint,
        ...metadata,
        verifiedAt: new Date().toISOString(),
        isFavorite: false
      };
      
      verifiedContent.push(verifiedItem);
      localStorage.setItem('meshplay_verified_content', JSON.stringify(verifiedContent));
      
      console.log(`⭐ Marked as verified: ${metadata.title}`);
    } catch (error) {
      console.error('Error marking content as verified:', error);
    }
  }

  async markAsFavorite(fingerprint: string): Promise<void> {
    try {
      const verifiedContent = JSON.parse(localStorage.getItem('meshplay_verified_content') || '[]');
      const item = verifiedContent.find((content: any) => content.fingerprint === fingerprint);
      
      if (item) {
        item.isFavorite = !item.isFavorite;
        localStorage.setItem('meshplay_verified_content', JSON.stringify(verifiedContent));
        console.log(`${item.isFavorite ? '❤️' : '💔'} Toggled favorite: ${item.title}`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  getVerifiedContent(): any[] {
    try {
      return JSON.parse(localStorage.getItem('meshplay_verified_content') || '[]');
    } catch {
      return [];
    }
  }

  removeFromQueue(uploadId: string): void {
    const item = this.uploadQueue.get(uploadId);
    if (item) {
      this.uploadQueue.delete(uploadId);
      this.saveQueueToStorage();
      this.notifyQueueCallbacks();
      console.log(`🗑️ Removed from queue: ${item.metadata.title}`);
    }
  }

  retryUpload(uploadId: string): void {
    const item = this.uploadQueue.get(uploadId);
    if (item && item.status === 'failed') {
      item.status = 'pending';
      item.retryCount = 0;
      item.error = undefined;
      this.notifyQueueCallbacks();
      
      if (this.isOnline) {
        this.processUpload(uploadId);
      }
    }
  }

  pauseUpload(uploadId: string): void {
    const item = this.uploadQueue.get(uploadId);
    if (item && item.status === 'uploading') {
      item.status = 'paused';
      this.notifyQueueCallbacks();
    }
  }

  getUploadQueue(): UploadQueueItem[] {
    return Array.from(this.uploadQueue.values());
  }

  getSyncStats(): SyncStats {
    const queue = this.getUploadQueue();
    const totalRetries = queue.reduce((sum, item) => sum + item.retryCount, 0);
    
    return {
      totalUploads: queue.length,
      completedUploads: queue.filter(item => item.status === 'completed').length,
      failedUploads: queue.filter(item => item.status === 'failed').length,
      pendingUploads: queue.filter(item => item.status === 'pending').length,
      totalRetries,
      avgUploadTime: 0, // TODO: Calculate based on actual upload times
      lastSyncTime: new Date(),
      isOnline: this.isOnline
    };
  }

  onSyncStatsChange(callback: (stats: SyncStats) => void): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  onQueueChange(callback: (queue: UploadQueueItem[]) => void): () => void {
    this.queueCallbacks.push(callback);
    return () => {
      const index = this.queueCallbacks.indexOf(callback);
      if (index > -1) {
        this.queueCallbacks.splice(index, 1);
      }
    };
  }

  private notifySyncCallbacks(): void {
    const stats = this.getSyncStats();
    this.syncCallbacks.forEach(callback => callback(stats));
  }

  private notifyQueueCallbacks(): void {
    const queue = this.getUploadQueue();
    this.queueCallbacks.forEach(callback => callback(queue));
  }
}

// Export singleton
export const uploadSyncService = new UploadSyncService();