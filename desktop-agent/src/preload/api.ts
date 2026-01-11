declare global {
  interface Window {
    electronAPI: {
      getActivity: () => Promise<any>;
      syncData: () => Promise<void>;
      getStatus: () => Promise<{ status: string; uptime: number }>;
    };
  }
}

export {};
