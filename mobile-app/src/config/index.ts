export const config = {
  apiUrl: process.env.API_URL || 'https://api.sentinela.com',
  appName: 'Sentinela',
  version: '1.0.0',
  buildNumber: '1',
  supportEmail: 'support@sentinela.com',
  features: { pushNotifications: true, biometricAuth: true, offlineMode: false },
  analytics: { enabled: true, trackingId: 'UA-XXXXXXXX-X' },
  theme: { primaryColor: '#007AFF', secondaryColor: '#5856D6', backgroundColor: '#F5F5F5' },
};