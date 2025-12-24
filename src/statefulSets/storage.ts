export class PersistentVolumeManager {
  private volumes: Map<string, PersistentVolume> = new Map();
  private claims: Map<string, PersistentVolumeClaim> = new Map();
  
  createVolume(pv: PersistentVolume): void { this.volumes.set(pv.name, pv); }
  createClaim(pvc: PersistentVolumeClaim): void { this.claims.set(pvc.namespace + '/' + pvc.name, pvc); this.bind(pvc); }
  
  private bind(pvc: PersistentVolumeClaim): void {
    for (const pv of this.volumes.values()) {
      if (pv.status === 'Available' && this.matches(pv, pvc)) {
        pv.status = 'Bound';
        pv.claimRef = { namespace: pvc.namespace, name: pvc.name };
        pvc.volumeName = pv.name;
        pvc.status = 'Bound';
        break;
      }
    }
  }
  
  private matches(pv: PersistentVolume, pvc: PersistentVolumeClaim): boolean {
    return parseInt(pv.capacity) >= parseInt(pvc.requestedStorage);
  }
  
  getVolume(name: string): PersistentVolume | undefined { return this.volumes.get(name); }
  getClaim(namespace: string, name: string): PersistentVolumeClaim | undefined { return this.claims.get(namespace + '/' + name); }
}

export interface PersistentVolume { name: string; capacity: string; status: 'Available' | 'Bound' | 'Released'; claimRef?: { namespace: string; name: string }; }
export interface PersistentVolumeClaim { namespace: string; name: string; requestedStorage: string; volumeName?: string; status: 'Pending' | 'Bound'; }