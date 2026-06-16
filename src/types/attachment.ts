// Attachment types for Sentinela v17

export interface Attachment {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  resourceType: AttachmentResourceType;
  resourceId: string;
  url: string;
  thumbnailUrl?: string;
  path: string;
  mimeType: string;
  extension: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  hash: string;
  encoding?: string;
  metadata?: unknown;
  uploadedBy: string;
  isPublic: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type AttachmentResourceType =
  | "comment"
  | "report"
  | "alert"
  | "employee"
  | "project"
  | "message"
  | "document";

export interface AttachmentUpload {
  file: File;
  resourceType: AttachmentResourceType;
  resourceId: string;
  description?: string;
  isPublic?: boolean;
  expiresAt?: string;
}

export interface AttachmentFilters {
  resourceType?: AttachmentResourceType;
  resourceId?: string;
  mimeType?: string;
  uploadedBy?: string;
  minSize?: number;
  maxSize?: number;
  startDate?: string;
  endDate?: string;
}

export interface AttachmentStats {
  total: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
  byResource: Record<AttachmentResourceType, number>;
}

export interface UploadProgress {
  attachmentId: string;
  progress: number;
  status: "pending" | "uploading" | "processing" | "complete" | "failed";
  error?: string;
}

export interface AttachmentPreview {
  url: string;
  type: "image" | "video" | "audio" | "document" | "other";
  thumbnailUrl?: string;
  previewable: boolean;
}

export interface BulkAttachmentAction {
  attachmentIds: string[];
  action: "delete" | "move" | "archive" | "makePublic" | "makePrivate";
  targetResourceType?: AttachmentResourceType;
  targetResourceId?: string;
}
