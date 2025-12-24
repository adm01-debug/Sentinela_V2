export class FinalizerManager {
  private readonly finalizerName: string;
  
  constructor(operatorName: string) { this.finalizerName = operatorName + '.finalizers.io'; }
  
  hasFinalizer(resource: { metadata: { finalizers?: string[] } }): boolean {
    return resource.metadata.finalizers?.includes(this.finalizerName) ?? false;
  }
  
  addFinalizer(resource: { metadata: { finalizers?: string[] } }): void {
    if (!resource.metadata.finalizers) resource.metadata.finalizers = [];
    if (!this.hasFinalizer(resource)) resource.metadata.finalizers.push(this.finalizerName);
  }
  
  removeFinalizer(resource: { metadata: { finalizers?: string[] } }): void {
    if (resource.metadata.finalizers) {
      resource.metadata.finalizers = resource.metadata.finalizers.filter(f => f !== this.finalizerName);
    }
  }
  
  isBeingDeleted(resource: { metadata: { deletionTimestamp?: Date } }): boolean {
    return resource.metadata.deletionTimestamp !== undefined;
  }
}