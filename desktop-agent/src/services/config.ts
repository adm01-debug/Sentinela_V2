import Store from 'electron-store';

interface Config {
  apiUrl: string;
  apiKey: string;
  screenshotInterval: number;
  activityInterval: number;
  syncInterval: number;
  blurScreenshots: boolean;
  ignoredApps: string[];
}

const defaults: Config = {
  apiUrl: '',
  apiKey: '',
  screenshotInterval: 300000, // 5 minutes
  activityInterval: 60000, // 1 minute
  syncInterval: 300000, // 5 minutes
  blurScreenshots: false,
  ignoredApps: [],
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
}
