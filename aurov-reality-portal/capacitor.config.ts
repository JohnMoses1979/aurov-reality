import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aurov.reality',
  appName: 'Aurov Reality',
  webDir: 'dist',
  server: {
    url: 'http://52.220.243.146:8080',
    cleartext: true
  }
};

export default config;
