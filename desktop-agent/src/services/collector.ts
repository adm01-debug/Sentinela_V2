interface Activity {
  timestamp: Date;
  activeWindow: string;
  idleTime: number;
}

export async function collectActivity(): Promise<Activity> {
  return {
    timestamp: new Date(),
    activeWindow: 'Unknown',
    idleTime: 0,
  };
}
