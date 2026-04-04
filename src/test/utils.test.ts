/**
 * SENTINELA - Utility & Helper Functions Test Suite
 */
import { describe, it, expect } from 'vitest';

// ============================================================
// Data Validation Tests
// ============================================================

describe('Data Validation', () => {
  describe('Email Validation', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    it('should accept valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
      expect(isValidEmail('user+tag@domain.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @domain.com')).toBe(false);
    });
  });

  describe('Password Strength', () => {
    const isStrongPassword = (pwd: string) =>
      pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd);

    it('should accept strong passwords', () => {
      expect(isStrongPassword('StrongPass1')).toBe(true);
      expect(isStrongPassword('MyP4ssword!')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isStrongPassword('short')).toBe(false);
      expect(isStrongPassword('alllowercase1')).toBe(false);
      expect(isStrongPassword('ALLUPPERCASE1')).toBe(false);
      expect(isStrongPassword('NoNumbers')).toBe(false);
    });
  });

  describe('IP Address Validation', () => {
    const isValidIP = (ip: string) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && ip.split('.').every(n => parseInt(n) <= 255);

    it('should accept valid IPs', () => {
      expect(isValidIP('192.168.1.1')).toBe(true);
      expect(isValidIP('10.0.0.1')).toBe(true);
      expect(isValidIP('255.255.255.255')).toBe(true);
    });

    it('should reject invalid IPs', () => {
      expect(isValidIP('256.1.1.1')).toBe(false);
      expect(isValidIP('1.2.3')).toBe(false);
      expect(isValidIP('not.an.ip.address')).toBe(false);
    });
  });

  describe('MAC Address Validation', () => {
    const isValidMAC = (mac: string) => /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);

    it('should accept valid MACs', () => {
      expect(isValidMAC('00:1B:44:11:3A:B7')).toBe(true);
      expect(isValidMAC('00-1B-44-11-3A-B7')).toBe(true);
    });

    it('should reject invalid MACs', () => {
      expect(isValidMAC('not-a-mac')).toBe(false);
      expect(isValidMAC('00:1B:44')).toBe(false);
    });
  });
});

// ============================================================
// Date & Time Utils
// ============================================================

describe('Date Utilities', () => {
  it('should detect dates within range', () => {
    const isInRange = (date: Date, start: Date, end: Date) => date >= start && date <= end;
    const now = new Date();
    const start = new Date(now.getTime() - 86400000);
    const end = new Date(now.getTime() + 86400000);
    expect(isInRange(now, start, end)).toBe(true);
    expect(isInRange(new Date('2020-01-01'), start, end)).toBe(false);
  });

  it('should calculate time differences', () => {
    const diffMinutes = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;
    const t1 = new Date('2026-03-15T10:00:00');
    const t2 = new Date('2026-03-15T10:30:00');
    expect(diffMinutes(t1, t2)).toBe(30);
  });

  it('should detect work hours', () => {
    const isWorkHour = (hour: number) => hour >= 9 && hour < 18;
    expect(isWorkHour(10)).toBe(true);
    expect(isWorkHour(20)).toBe(false);
    expect(isWorkHour(8)).toBe(false);
  });
});

// ============================================================
// Geofence Calculations
// ============================================================

describe('Geofence Calculations', () => {
  const haversineDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  it('should calculate zero distance for same point', () => {
    expect(haversineDistance(-23.5, -46.6, -23.5, -46.6)).toBe(0);
  });

  it('should calculate approximate distance between São Paulo and Rio', () => {
    const dist = haversineDistance(-23.55, -46.63, -22.91, -43.17);
    expect(dist).toBeGreaterThan(350000);
    expect(dist).toBeLessThan(400000);
  });

  it('should detect point inside geofence', () => {
    const isInside = (lat: any, lon: any, cLat: any, cLon: any, radius: any) =>
      haversineDistance(lat, lon, cLat, cLon) <= radius;
    expect(isInside(-23.550, -46.630, -23.550, -46.631, 500)).toBe(true);
  });

  it('should detect point outside geofence', () => {
    const isInside = (lat: any, lon: any, cLat: any, cLon: any, radius: any) =>
      haversineDistance(lat, lon, cLat, cLon) <= radius;
    expect(isInside(-23.550, -46.630, -22.910, -43.170, 500)).toBe(false);
  });
});

// ============================================================
// Productivity Calculations
// ============================================================

describe('Productivity Calculations', () => {
  const calculateProductivity = (active: any, idle: any) => {
    const total = active + idle;
    return total > 0 ? Math.round((active / total) * 100) : 0;
  };

  it('should return 0 for no activity', () => {
    expect(calculateProductivity(0, 0)).toBe(0);
  });

  it('should return 100 for all active', () => {
    expect(calculateProductivity(3600, 0)).toBe(100);
  });

  it('should return 50 for equal active/idle', () => {
    expect(calculateProductivity(1800, 1800)).toBe(50);
  });

  it('should calculate correctly for typical day', () => {
    const result = calculateProductivity(25200, 3600); // 7h active, 1h idle
    expect(result).toBe(88);
  });
});

// ============================================================
// Security Score
// ============================================================

describe('Security Score', () => {
  const calcSecurityScore = (violations: any, totalDays: any) => {
    if (totalDays === 0) return 100;
    const violationsPerDay = violations / totalDays;
    return Math.max(0, Math.round(100 - violationsPerDay * 20));
  };

  it('should return 100 for no violations', () => {
    expect(calcSecurityScore(0, 30)).toBe(100);
  });

  it('should decrease with more violations', () => {
    expect(calcSecurityScore(5, 30)).toBeGreaterThan(calcSecurityScore(15, 30));
  });

  it('should not go below 0', () => {
    expect(calcSecurityScore(1000, 1)).toBe(0);
  });
});
