export interface Screenshot {
  id: string;
  employeeId: string;
  url: string;
  thumbnail?: string;
  width: number;
  height: number;
  blurred: boolean;
  metadata?: ScreenshotMetadata;
  capturedAt: string;
}

export interface ScreenshotMetadata {
  appName?: string;
  windowTitle?: string;
  url?: string;
}