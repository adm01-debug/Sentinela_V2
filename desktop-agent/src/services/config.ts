import Store from 'electron-store';

// ============================================================
// DESKTOP AGENT CONFIGURATION
// ============================================================

interface Config {
  apiUrl: string;
  apiKey: string;
  screenshotInterval: number;
  activityInterval: number;
  syncInterval: number;
  blurScreenshots: boolean;
  ignoredApps: string[];
  updateServerUrl: string;
  autoUpdateEnabled: boolean;
  updateCheckInterval: number;
}

const defaults: Config = {
  apiUrl: '',
  apiKey: '',
  screenshotInterval: 300000, // 5 minutes
  activityInterval: 60000, // 1 minute
  syncInterval: 300000, // 5 minutes
  blurScreenshots: false,
  ignoredApps: [],
  // Auto-update configuration
  updateServerUrl: 'https://releases.sentinela.app/desktop-agent',
  autoUpdateEnabled: true,
  updateCheckInterval: 3600000, // 1 hour
};

export class ConfigService {
  private store: Store<Config>;
  
  constructor() {
    this.store = new Store<Config>({ defaults });
  }
  
  get<K extends keyof Config>(key: K): Config[K] {
    return this.store.get(key);
  }
  
  set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.store.set(key, value);
  }
  
  getAll(): Config {
    return this.store.store;
  }
  
  reset(): void {
    this.store.clear();
  }
}

// ============================================================
// SINGLETON CONFIG EXPORT
// ============================================================

const configService = new ConfigService();

export const config = {
  get apiUrl() { return configService.get('apiUrl'); },
  get apiKey() { return configService.get('apiKey'); },
  get screenshotInterval() { return configService.get('screenshotInterval'); },
  get activityInterval() { return configService.get('activityInterval'); },
  get syncInterval() { return configService.get('syncInterval'); },
  get blurScreenshots() { return configService.get('blurScreenshots'); },
  get ignoredApps() { return configService.get('ignoredApps'); },
  get updateServerUrl() { return configService.get('updateServerUrl'); },
  get autoUpdateEnabled() { return configService.get('autoUpdateEnabled'); },
  get updateCheckInterval() { return configService.get('updateCheckInterval'); },
};

export default configService;
