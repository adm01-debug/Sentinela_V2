import { Image, ScanResult, Vulnerability } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ImageScanner {
  private vulnDb: Map<string, VulnInfo[]> = new Map();
  
  async scan(image: Image): Promise<ScanResult> {
    const vulnerabilities: Vulnerability[] = [];
    
    for (const layer of image.layers) {
      const layerVulns = this.scanLayer(layer.digest);
      vulnerabilities.push(...layerVulns);
    }
    
    return { image: image.name + ':' + image.tag, vulnerabilities, scanDate: new Date() };
  }
  
  private scanLayer(digest: string): Vulnerability[] {
    return [];
  }
  
  addVulnerability(packageName: string, vuln: VulnInfo): void {
    const vulns = this.vulnDb.get(packageName) ?? [];
    vulns.push(vuln);
    this.vulnDb.set(packageName, vulns);
  }
  
  getSeverityCounts(result: ScanResult): Record<string, number> {
    const counts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    result.vulnerabilities.forEach(v => counts[v.severity]++);
    return counts;
  }
}

export interface VulnInfo { id: string; severity: Vulnerability['severity']; description: string; }