import { supabase } from '@/integrations/supabase/client';
export class StorageInfra {
  private bucket = 'uploads';
  async upload(file: File, path: string): Promise<string> { const { error } = await supabase.storage.from(this.bucket).upload(path, file); if (error) throw error; return this.getUrl(path); }
  async download(path: string): Promise<Blob> { const { data, error } = await supabase.storage.from(this.bucket).download(path); if (error) throw error; return data; }
  async delete(path: string): Promise<void> { const { error } = await supabase.storage.from(this.bucket).remove([path]); if (error) throw error; }
  getUrl(path: string): string { return supabase.storage.from(this.bucket).getPublicUrl(path).data.publicUrl; }
}
export const storageInfra = new StorageInfra();
