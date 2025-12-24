export class PodIdentity {
  getHostname(statefulSetName: string, ordinal: number): string { return statefulSetName + '-' + ordinal; }
  
  getDNSName(statefulSetName: string, ordinal: number, serviceName: string, namespace: string): string {
    return this.getHostname(statefulSetName, ordinal) + '.' + serviceName + '.' + namespace + '.svc.cluster.local';
  }
  
  getHeadlessServiceDNS(serviceName: string, namespace: string): string {
    return serviceName + '.' + namespace + '.svc.cluster.local';
  }
  
  parseOrdinal(podName: string): number {
    const parts = podName.split('-');
    return parseInt(parts[parts.length - 1]);
  }
  
  isLeader(podName: string): boolean { return this.parseOrdinal(podName) === 0; }
}