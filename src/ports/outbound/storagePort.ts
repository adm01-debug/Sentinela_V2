export interface StoragePort {
  upload(file: File, path: string): Promise<string>;
  download(path: string): Promise<Blob>;
  delete(path: string): Promise<void>;
  getUrl(path: string): Promise<string>;
  list(prefix: string): Promise<string[]>;
}
