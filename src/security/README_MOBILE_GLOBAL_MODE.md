# Global Mode Mobile Integration

## Overview

This document covers mobile-specific integrations for Global Mode using Capacitor, enabling native capabilities for bridge operation and global connectivity on Android and iOS.

## Key Mobile Features

### Background Processing
- **Bridge Mode**: Continuous operation when app is backgrounded
- **Wake Locks**: Prevent device sleep during active sessions
- **Background Sync**: Queue messages during network interruptions
- **Battery Optimization**: Request exclusion from power management

### Device Security
- **Hardware Attestation**: Verify device integrity for bridge operation
- **Strongbox**: Use hardware-backed security module
- **Biometric Auth**: Fingerprint/face verification for sensitive operations
- **Root/Jailbreak Detection**: Block compromised devices

### Network Management
- **Connection Monitoring**: Track cellular/WiFi changes
- **Quality Assessment**: Measure signal strength and bandwidth
- **Roaming Detection**: Adjust data usage based on network costs
- **Offline Support**: Store-and-forward messaging

## Installation

### 1. Install Capacitor Dependencies
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npm install @capacitor/background-mode
npm install @capacitor/network
npm install @capacitor/device
```

### 2. Initialize Capacitor
```bash
npx cap init mesh-tv-network app.lovable.meshtv
```

### 3. Configure Platforms
```bash
npx cap add android
npx cap add ios
```

### 4. Add Background Permissions

#### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.INTERNET" />

<service android:name=".GlobalModeService" 
         android:enabled="true"
         android:exported="false"
         android:foregroundServiceType="dataSync" />
```

#### iOS (ios/App/App/Info.plist)
```xml
<key>UIBackgroundModes</key>
<array>
    <string>background-processing</string>
    <string>background-fetch</string>
</array>
<key>NSLocalNetworkUsageDescription</key>
<string>Global Mode requires network access for mesh connectivity</string>
```

## Usage Examples

### Enable Bridge Mode
```typescript
import { capacitorGlobalMode } from '@/services/globalmode/capacitorIntegration';
import { GlobalModeCoordinator } from '@/services/globalmode/GlobalModeCoordinator';

// Check prerequisites
const attestation = await capacitorGlobalMode.checkDeviceAttestation();
if (!attestation.available) {
    throw new Error('Device attestation not available');
}

const batteryOpt = await capacitorGlobalMode.checkBatteryOptimization();
if (!batteryOpt.disabled) {
    await capacitorGlobalMode.requestDisableBatteryOptimization();
}

// Request background permissions
const bgPermissions = await capacitorGlobalMode.requestBackgroundPermissions();
if (!bgPermissions.granted) {
    throw new Error('Background permissions required for bridge mode');
}

// Enable bridge mode
const result = await capacitorGlobalMode.enableBridgeMode();
if (!result.success) {
    throw new Error(`Bridge mode failed: ${result.error}`);
}
```

### Monitor Network Changes
```typescript
// Start network monitoring
await capacitorGlobalMode.startNetworkMonitoring((networkInfo) => {
    console.log(`Network: ${networkInfo.type}, Strength: ${networkInfo.strength}`);
    
    // Adjust behavior based on network
    if (networkInfo.type === 'cellular') {
        // Reduce data usage on cellular
        globalModeCoordinator.setDataSavingMode(true);
    } else if (networkInfo.type === 'wifi') {
        // Full functionality on WiFi
        globalModeCoordinator.setDataSavingMode(false);
    }
});
```

### Background Message Handling
```typescript
// Schedule background sync for queued messages
await capacitorGlobalMode.scheduleBackgroundSync('global_messages', {
    messages: queuedMessages,
    targetPeers: ['peer1', 'peer2'],
    priority: 'normal'
});

// Process background tasks when app becomes active
const tasks = await capacitorGlobalMode.getScheduledTasks();
for (const task of tasks) {
    if (task.id === 'global_messages') {
        await processQueuedMessages(task.data);
    }
}
```

### Notifications for Global Events
```typescript
// Connection established
await capacitorGlobalMode.showNotification(
    'Global Connection',
    'Connected to peer in Europe',
    false
);

// Bridge session started
await capacitorGlobalMode.showNotification(
    'Bridge Active',
    'Relaying connections between mesh networks',
    true
);

// Vibrate for important events
await capacitorGlobalMode.vibrate([100, 50, 100]); // Short pulse pattern
```

## Native Implementation Guide

### Android Bridge Service
```kotlin
class GlobalModeService : Service() {
    private var bridgeManager: BridgeManager? = null
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        
        bridgeManager = BridgeManager()
        bridgeManager?.start()
        
        return START_STICKY // Restart if killed
    }
    
    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Global Mode Bridge")
            .setContentText("Relaying mesh connections")
            .setSmallIcon(R.drawable.ic_bridge)
            .setOngoing(true)
            .build()
    }
}
```

### iOS Background Processing
```swift
import BackgroundTasks

class GlobalModeManager {
    func scheduleBackgroundProcessing() {
        let request = BGAppRefreshTaskRequest(identifier: "app.meshtv.global-sync")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes
        
        try? BGTaskScheduler.shared.submit(request)
    }
    
    func handleBackgroundTask(task: BGAppRefreshTask) {
        task.expirationHandler = {
            task.setTaskCompleted(success: false)
        }
        
        // Process queued global messages
        processGlobalMessages { success in
            task.setTaskCompleted(success: success)
        }
    }
}
```

## Security Considerations

### Device Attestation (Android)
```kotlin
// SafetyNet/Play Integrity API
class DeviceAttestationService {
    fun checkIntegrity(): AttestationResult {
        val nonce = generateNonce()
        
        return SafetyNet.getClient(context)
            .attest(nonce, BuildConfig.SAFETYNET_API_KEY)
            .addOnSuccessListener { response ->
                val jwsResult = response.jwsResult
                val claims = parseJWS(jwsResult)
                
                AttestationResult(
                    basicIntegrity = claims.basicIntegrity,
                    ctsProfileMatch = claims.ctsProfileMatch,
                    strongboxSupported = isStrongboxSupported()
                )
            }
    }
}
```

### Keystore Security (iOS)
```swift
// Secure Enclave key generation
class SecureKeyManager {
    func generateBridgeKey() throws -> SecKey {
        let attributes: [String: Any] = [
            kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
            kSecAttrKeySizeInBits as String: 256,
            kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
            kSecPrivateKeyAttrs as String: [
                kSecAttrIsPermanent as String: true,
                kSecAttrApplicationTag as String: "bridge.key".data(using: .utf8)!,
                kSecAttrAccessControl as String: SecAccessControlCreateWithFlags(
                    nil,
                    kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
                    [.privateKeyUsage, .biometryAny],
                    nil
                )!
            ]
        ]
        
        var error: Unmanaged<CFError>?
        let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error)
        
        if let error = error {
            throw error.takeRetainedValue() as Error
        }
        
        return privateKey!
    }
}
```

## Performance Optimization

### Battery Management
```typescript
// Monitor battery level and adjust bridge operation
class BatteryAwareBridge {
    private batteryThreshold = 20; // Minimum 20%
    
    async checkBatteryStatus(): Promise<boolean> {
        const level = await Device.getBatteryInfo();
        
        if (level.batteryLevel && level.batteryLevel < this.batteryThreshold) {
            // Reduce bridge sessions
            await this.reduceBridgeSessions();
            return false;
        }
        
        return true;
    }
    
    private async reduceBridgeSessions(): Promise<void> {
        // Close non-critical bridge sessions
        // Reduce relay data rate
        // Enter power-saving mode
    }
}
```

### Data Usage Monitoring
```typescript
// Track and limit data usage
class DataUsageManager {
    private dailyLimit = 500 * 1024 * 1024; // 500 MB
    private usage = 0;
    
    async trackDataUsage(bytes: number): Promise<boolean> {
        this.usage += bytes;
        
        if (this.usage > this.dailyLimit) {
            await this.enterDataSavingMode();
            return false;
        }
        
        return true;
    }
    
    private async enterDataSavingMode(): Promise<void> {
        // Reduce video quality
        // Compress data more aggressively
        // Limit concurrent connections
    }
}
```

## Testing on Mobile

### Development Testing
```bash
# Build and test on Android
npm run build
npx cap copy android
npx cap run android

# Build and test on iOS  
npm run build
npx cap copy ios
npx cap run ios
```

### Performance Testing
```typescript
// Mobile-specific performance tests
export class MobilePerformanceTests {
    async testBatteryImpact(): Promise<void> {
        const initialBattery = await Device.getBatteryInfo();
        
        // Run bridge mode for 1 hour
        await this.runBridgeMode(3600000);
        
        const finalBattery = await Device.getBatteryInfo();
        const batteryDrain = initialBattery.batteryLevel! - finalBattery.batteryLevel!;
        
        // Should be less than 12% per hour
        if (batteryDrain > 0.12) {
            throw new Error(`Excessive battery drain: ${batteryDrain * 100}%`);
        }
    }
    
    async testNetworkFallback(): Promise<void> {
        // Test WiFi to cellular handoff
        // Verify connection maintains during network changes
        // Check data usage on different network types
    }
}
```

## Deployment Checklist

### Android
- [ ] App signing certificates configured
- [ ] Background permissions added to manifest
- [ ] Foreground service implemented
- [ ] Battery optimization exclusion requested
- [ ] SafetyNet/Play Integrity configured
- [ ] Notification channels created
- [ ] Data usage monitoring implemented

### iOS
- [ ] Background modes enabled in Info.plist
- [ ] Local network usage description added
- [ ] Background task identifiers registered
- [ ] Secure Enclave integration tested
- [ ] App Transport Security configured
- [ ] Background refresh permissions requested

### Cross-Platform
- [ ] Configuration loading tested
- [ ] Error handling for missing permissions
- [ ] Graceful degradation when features unavailable
- [ ] Performance monitoring integrated
- [ ] Crash reporting configured
- [ ] Analytics for feature usage

## Troubleshooting

### Common Issues
1. **Background execution stopped**: Check battery optimization settings
2. **Network connectivity issues**: Verify permissions and firewall rules
3. **High battery drain**: Profile code and reduce unnecessary wake locks
4. **Crash on startup**: Check device compatibility and error logs
5. **Performance degradation**: Monitor memory usage and connection counts

### Debug Commands
```bash
# Android logging
adb logcat | grep GlobalMode

# iOS logging  
xcrun simctl spawn booted log stream --predicate 'process == "MeshTV"'

# Performance profiling
npm run profile:mobile
```

---

For additional support, see the main [Global Mode README](../README_GLOBAL_MODE.md) and [Security Documentation](../../SECURITY_README.md).