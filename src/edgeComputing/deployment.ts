import { EdgeFunction, EdgeDeployment, EdgeLocation } from './types';
import { v4 as uuidv4 } from 'uuid';

export class EdgeDeploymentManager {
  private deployments: Map<string, EdgeDeployment> = new Map();
  private locations: EdgeLocation[] = [];
  
  addLocation(location: EdgeLocation): void { this.locations.push(location); }
  
  async deploy(fn: EdgeFunction, targetLocations?: string[]): Promise<EdgeDeployment> {
    const locations = targetLocations ?? this.locations.map(l => l.id);
    const deployment: EdgeDeployment = { functionId: fn.id, locations, status: 'deploying', version: uuidv4().slice(0, 8) };
    this.deployments.set(fn.id, deployment);
    
    await new Promise(r => setTimeout(r, 100));
    deployment.status = 'active';
    return deployment;
  }
  
  async rollback(functionId: string): Promise<void> {
    const deployment = this.deployments.get(functionId);
    if (deployment) deployment.status = 'deploying';
  }
  
  getDeployment(functionId: string): EdgeDeployment | undefined { return this.deployments.get(functionId); }
  getHealthyLocations(): EdgeLocation[] { return this.locations.filter(l => l.healthy); }
}