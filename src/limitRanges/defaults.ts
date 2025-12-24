import { LimitRangeItem, ResourceValues } from './types';

export class DefaultsApplier {
  applyDefaults(request: ResourceRequest, limits: LimitRangeItem): ResourceRequest {
    const result = { ...request };
    
    if (limits.default) {
      if (!result.limits) result.limits = {};
      if (limits.default.cpu && !result.limits.cpu) result.limits.cpu = limits.default.cpu;
      if (limits.default.memory && !result.limits.memory) result.limits.memory = limits.default.memory;
    }
    
    if (limits.defaultRequest) {
      if (!result.requests) result.requests = {};
      if (limits.defaultRequest.cpu && !result.requests.cpu) result.requests.cpu = limits.defaultRequest.cpu;
      if (limits.defaultRequest.memory && !result.requests.memory) result.requests.memory = limits.defaultRequest.memory;
    }
    
    return result;
  }
}

export interface ResourceRequest { limits?: ResourceValues; requests?: ResourceValues; }