import { IPBlock } from './types';

export class IPBlockMatcher {
  matches(ipBlock: IPBlock, ip: string): boolean {
    if (!this.ipInCidr(ip, ipBlock.cidr)) return false;
    if (ipBlock.except) {
      for (const except of ipBlock.except) {
        if (this.ipInCidr(ip, except)) return false;
      }
    }
    return true;
  }
  
  private ipInCidr(ip: string, cidr: string): boolean {
    const [network, bits] = cidr.split('/');
    const mask = parseInt(bits);
    const ipNum = this.ipToNum(ip);
    const netNum = this.ipToNum(network);
    const maskNum = -1 << (32 - mask);
    return (ipNum & maskNum) === (netNum & maskNum);
  }
  
  private ipToNum(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  }
}

export class CIDRValidator {
  isValid(cidr: string): boolean {
    const parts = cidr.split('/');
    if (parts.length !== 2) return false;
    const [ip, bits] = parts;
    const bitsNum = parseInt(bits);
    if (isNaN(bitsNum) || bitsNum < 0 || bitsNum > 32) return false;
    return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip);
  }
}