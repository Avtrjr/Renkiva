/**
 * Capacitor Global Mode Integration
 * Mobile-specific features for global mesh connectivity
 */

import { Capacitor } from '@capacitor/core';

interface CapacitorGlobalMode {
  requestBackgroundPermissions(): Promise<{ granted: boolean }>;
  enableBridgeMode(): Promise<{ success: boolean; error?: string }>;
  disableBridgeMode(): Promise<void>;
  checkBatteryOptimization(): Promise<{ disabled: boolean }>;
  requestDisableBatteryOptimization(): Promise<{ success: boolean }>;
  getNetworkInfo(): Promise<{ type: string; strength: number; }>;
  enableKeepAwake(): Promise<void>;
  disableKeepAwake(): Promise<void>;
  checkDeviceAttestation(): Promise<{ 
    available: boolean; 
    strongboxSupported: boolean;
    verdict: string;
  }>;
}

class CapacitorGlobalModePlugin {
  private isNative = Capacitor.isNativePlatform();

  async requestBackgroundPermissions(): Promise<{ granted: boolean }> {
    if (!this.isNative) {
      return { granted: true }; // Web doesn't need background permissions
    }

    try {
      // In a real implementation, this would call native code
      console.log('📱 Requesting background permissions for Global Mode');
      
      // Mock implementation
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ granted: true });
        }, 1000);
      });
    } catch (error) {
      console.error('Failed to request background permissions:', error);
      return { granted: false };
    }
  }

  async enableBridgeMode(): Promise<{ success: boolean; error?: string }> {
    if (!this.isNative) {
      console.log('🌉 Bridge mode enabled (web simulation)');
      return { success: true };
    }

    try {
      // Check battery optimization
      const batteryOpt = await this.checkBatteryOptimization();
      if (!batteryOpt.disabled) {
        return { 
          success: false, 
          error: 'Battery optimization must be disabled for bridge mode' 
        };
      }

      // Enable background processing
      await this.enableKeepAwake();

      // Start native bridge service
      console.log('📱 Starting native bridge service');
      
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to enable bridge mode:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  async disableBridgeMode(): Promise<void> {
    if (!this.isNative) {
      console.log('🌉 Bridge mode disabled (web)');
      return;
    }

    try {
      // Disable background processing
      await this.disableKeepAwake();

      // Stop native bridge service
      console.log('📱 Stopping native bridge service');
    } catch (error) {
      console.error('Failed to disable bridge mode:', error);
    }
  }

  async checkBatteryOptimization(): Promise<{ disabled: boolean }> {
    if (!this.isNative) {
      return { disabled: true }; // Not applicable on web
    }

    try {
      // Mock implementation - would check actual battery optimization status
      console.log('🔋 Checking battery optimization status');
      return { disabled: true };
    } catch (error) {
      console.error('Failed to check battery optimization:', error);
      return { disabled: false };
    }
  }

  async requestDisableBatteryOptimization(): Promise<{ success: boolean }> {
    if (!this.isNative) {
      return { success: true };
    }

    try {
      console.log('🔋 Requesting to disable battery optimization');
      
      // This would open the battery optimization settings
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 2000);
      });
    } catch (error) {
      console.error('Failed to request battery optimization disable:', error);
      return { success: false };
    }
  }

  async getNetworkInfo(): Promise<{ type: string; strength: number }> {
    if (!this.isNative) {
      // Web network detection
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      return {
        type: connection?.effectiveType || 'unknown',
        strength: connection?.downlink ? Math.min(connection.downlink / 10, 1) : 0.8
      };
    }

    try {
      // Native network info
      console.log('📶 Getting native network info');
      return {
        type: 'wifi', // Mock values
        strength: 0.85
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      return { type: 'unknown', strength: 0 };
    }
  }

  async enableKeepAwake(): Promise<void> {
    if (!this.isNative) {
      // Web keep awake using Wake Lock API
      if ('wakeLock' in navigator) {
        try {
          await (navigator as any).wakeLock.request('screen');
          console.log('💡 Screen wake lock enabled');
        } catch (error) {
          console.warn('Wake lock not supported:', error);
        }
      }
      return;
    }

    try {
      console.log('📱 Enabling native keep awake');
      // Would call native keep awake functionality
    } catch (error) {
      console.error('Failed to enable keep awake:', error);
    }
  }

  async disableKeepAwake(): Promise<void> {
    if (!this.isNative) {
      console.log('💡 Web keep awake disabled');
      return;
    }

    try {
      console.log('📱 Disabling native keep awake');
      // Would call native keep awake disable
    } catch (error) {
      console.error('Failed to disable keep awake:', error);
    }
  }

  async checkDeviceAttestation(): Promise<{ 
    available: boolean; 
    strongboxSupported: boolean;
    verdict: string;
  }> {
    if (!this.isNative) {
      return {
        available: false,
        strongboxSupported: false,
        verdict: 'web_not_supported'
      };
    }

    try {
      console.log('🔒 Checking device attestation capabilities');
      
      // Mock implementation - would use actual device attestation
      return {
        available: true,
        strongboxSupported: true,
        verdict: 'MEETS_DEVICE_INTEGRITY'
      };
    } catch (error) {
      console.error('Device attestation check failed:', error);
      return {
        available: false,
        strongboxSupported: false,
        verdict: 'attestation_failed'
      };
    }
  }

  // Network monitoring for global connections
  async startNetworkMonitoring(callback: (info: { type: string; strength: number }) => void): Promise<void> {
    const updateNetworkInfo = async () => {
      const info = await this.getNetworkInfo();
      callback(info);
    };

    // Initial check
    await updateNetworkInfo();

    // Set up periodic monitoring
    setInterval(updateNetworkInfo, 5000); // Check every 5 seconds

    if (this.isNative) {
      console.log('📶 Started native network monitoring');
    } else {
      // Web network change events
      window.addEventListener('online', updateNetworkInfo);
      window.addEventListener('offline', updateNetworkInfo);
      
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', updateNetworkInfo);
      }
    }
  }

  // Vibration for connection events
  async vibrate(pattern: number[] = [200]): Promise<void> {
    if (!this.isNative && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    } else if (this.isNative) {
      console.log('📳 Native vibration triggered');
      // Would call native vibration
    }
  }

  // Local notification for global events
  async showNotification(title: string, body: string, persistent: boolean = false): Promise<void> {
    if (!this.isNative) {
      // Web notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon-192.png' });
      }
      return;
    }

    try {
      console.log(`📝 Showing native notification: ${title} - ${body}`);
      // Would use native notification API
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Background task handling
  async scheduleBackgroundSync(taskId: string, data: any): Promise<void> {
    if (!this.isNative) {
      // Web: Store for later processing
      localStorage.setItem(`bg_task_${taskId}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      return;
    }

    try {
      console.log(`⏰ Scheduling background task: ${taskId}`);
      // Would schedule native background task
    } catch (error) {
      console.error('Failed to schedule background sync:', error);
    }
  }

  async getScheduledTasks(): Promise<Array<{ id: string; data: any; timestamp: number }>> {
    if (!this.isNative) {
      // Web: Retrieve from localStorage
      const tasks = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('bg_task_')) {
          const taskId = key.replace('bg_task_', '');
          const taskData = JSON.parse(localStorage.getItem(key) || '{}');
          tasks.push({ id: taskId, ...taskData });
        }
      }
      return tasks;
    }

    try {
      console.log('📋 Getting scheduled background tasks');
      // Would get native scheduled tasks
      return [];
    } catch (error) {
      console.error('Failed to get scheduled tasks:', error);
      return [];
    }
  }
}

// Singleton instance
const capacitorGlobalMode = new CapacitorGlobalModePlugin();

export { capacitorGlobalMode, CapacitorGlobalModePlugin };
export type { CapacitorGlobalMode };
