interface AmplitudeConfig { apiKey: string; }

class AmplitudeClient {
  constructor(private config: AmplitudeConfig) {}
  track(event: string, props?: Record<string, unknown>) { console.log('Amplitude:', event, props); }
  identify(userId: string, traits?: Record<string, unknown>) { console.log('Identify:', userId, traits); }
}

export const amplitude = new AmplitudeClient({ apiKey: process.env.AMPLITUDE_API_KEY || '' });