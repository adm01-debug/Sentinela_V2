interface AWSConfig { region: string; accessKeyId: string; secretAccessKey: string; }

class AWSClient {
  constructor(private config: AWSConfig) {}
  async uploadToS3(bucket: string, key: string, body: Buffer) {
    console.log(`Uploading to s3://${bucket}/${key}`);
    return { bucket, key };
  }
}

export const aws = new AWSClient({ region: process.env.AWS_REGION || 'us-east-1', accessKeyId: process.env.AWS_ACCESS_KEY_ID || '', secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '' });