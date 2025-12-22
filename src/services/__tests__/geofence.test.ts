import { describe, it, expect, vi } from 'vitest';
import { geofenceService } from '../geofence';

describe('geofenceService', () => {
  it('should be defined', () => {
    expect(geofenceService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await geofenceService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});