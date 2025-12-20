import { net } from 'electron';

export class SyncService {
  private apiUrl: string;
  private apiKey: string;
  
  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }
  
  async sendData(endpoint: string, data: any): Promise<boolean> {
    return new Promise((resolve) => {
      const request = net.request({
        method: 'POST',
        url: `${this.apiUrl}/${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      request.on('response', (response) => {
        resolve(response.statusCode === 200);
      });
      
      request.on('error', () => resolve(false));
      
      request.write(JSON.stringify(data));
      request.end();
    });
  }
}
