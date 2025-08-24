import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0ccf7e051f49421fa13aa2b6f9fde12f',
  appName: 'mesh-tv-network',
  webDir: 'dist',
  server: {
    url: 'https://0ccf7e05-1f49-421f-a13a-a2b6f9fde12f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorSecureStoragePlugin: {
      fipsMode: true,
    },
    BiometricAuth: {
      disableBackup: true,
    }
  }
};

export default config;