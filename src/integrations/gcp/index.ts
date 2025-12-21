interface GCPConfig { projectId: string; credentials: string; }

class GCPClient {
  constructor(private config: GCPConfig) {}
  async uploadToGCS(bucket: string, filename: string, data: Buffer) {
    console.log(`Uploading to gs://${bucket}/${filename}`);
    return { bucket, filename };
  }
}

export const gcp = new GCPClient({ projectId: process.env.GCP_PROJECT_ID || '', credentials: process.env.GCP_CREDENTIALS || '' });