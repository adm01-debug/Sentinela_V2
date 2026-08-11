// Screenshot types for Sentinela v17

export interface Screenshot {
  id: string;
  employeeId: string;
  deviceId: string;
  activityId?: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  size: number;
  width: number;
  height: number;
  format: ImageFormat;
  hash: string;
  capturedAt: string;
  metadata: ScreenshotMetadata;
  analysis?: ScreenshotAnalysis;
  flags: ScreenshotFlag[];
  isBlurred: boolean;
  isArchived: boolean;
  retentionUntil?: string;
  createdAt: string;
  deletedAt?: string;
}

export type ImageFormat = 'png' | 'jpg' | 'webp';

export interface ScreenshotMetadata {
  activeWindow?: string;
  activeApplication?: string;
  browserUrl?: string;
  browserTitle?: string;
  monitorIndex: number;
  monitorName?: string;
  resolution: string;
  colorDepth: number;
  dpi: number;
  mousePosition?: { x: number; y: number };
  keyboardActivity: number;
  mouseActivity: number;
}

export interface ScreenshotAnalysis {
  isProductiveContent: boolean;
  productivityScore: number;
  detectedApplications: string[];
  detectedText?: string[];
  hasPersonalContent: boolean;
  hasSensitiveData: boolean;
  categories: string[];
  aiConfidence: number;
}

export interface ScreenshotFlag {
  type: FlagType;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  flaggedAt: string;
  flaggedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type FlagType = 
  | 'inappropriate_content'
  | 'sensitive_data'
  | 'policy_violation'
  | 'suspicious_activity'
  | 'manual_review'
  | 'ai_flagged';

export interface ScreenshotFilters {
  employeeId?: string;
  deviceId?: string;
  activityId?: string;
  startDate?: string;
  endDate?: string;
  application?: string;
  hasFlags?: boolean;
  flagType?: FlagType;
  isBlurred?: boolean;
  isArchived?: boolean;
  productivityMin?: number;
  productivityMax?: number;
}

export interface ScreenshotSettings {
  captureInterval: number;
  quality: 'low' | 'medium' | 'high';
  format: ImageFormat;
  blurSensitive: boolean;
  retentionDays: number;
  enableAiAnalysis: boolean;
  excludedApplications: string[];
  excludedUrls: string[];
}

export interface ScreenshotStats {
  total: number;
  today: number;
  flagged: number;
  archived: number;
  totalSize: number;
  averageProductivity: number;
}

export interface ScreenshotBulkAction {
  screenshotIds: string[];
  action: 'archive' | 'delete' | 'blur' | 'flag' | 'unflag';
  reason?: string;
}
