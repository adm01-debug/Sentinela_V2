interface MixpanelConfig { token: string; }

class MixpanelClient {
  constructor(private config: MixpanelConfig) {}
  track(event: string, properties?: Record<string, unknown>) {
    const data = btoa(JSON.stringify({ event, properties: { ...properties, token: this.config.token } }));
    fetch(`https://api.mixpanel.com/track?data=${data}`);
  }
}

export const mixpanel = new MixpanelClient({ token: process.env.MIXPANEL_TOKEN || '' });