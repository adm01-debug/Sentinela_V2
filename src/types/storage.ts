export interface StorageFile {
  id: string;
  bucket: string;
  path: string;
  name: string;
  size: number;
  contentType: string;
  url: string;
  createdAt: string;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  fileSizeLimit?: number;
  allowedMimeTypes?: string[];
}