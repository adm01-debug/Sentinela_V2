import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  employeeSchema,
  teamSchema,
  geofenceSchema,
  alertRuleSchema,
  webhookSchema,
  securityPolicySchema,
  workScheduleSchema,
  reportSchema,
  emailSchema,
  passwordSchema,
  nameSchema,
} from '@/lib/schemas';

describe('Zod Schemas', () => {
  describe('emailSchema', () => {
    it('accepts valid email', () => {
      expect(emailSchema.safeParse('user@example.com').success).toBe(true);
    });
    it('rejects invalid email', () => {
      expect(emailSchema.safeParse('not-email').success).toBe(false);
    });
    it('rejects empty string', () => {
      expect(emailSchema.safeParse('').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('accepts 8+ chars', () => {
      expect(passwordSchema.safeParse('12345678').success).toBe(true);
    });
    it('rejects < 8 chars', () => {
      expect(passwordSchema.safeParse('1234567').success).toBe(false);
    });
    it('rejects > 128 chars', () => {
      expect(passwordSchema.safeParse('a'.repeat(129)).success).toBe(false);
    });
  });

  describe('nameSchema', () => {
    it('trims whitespace', () => {
      const result = nameSchema.parse('  João  ');
      expect(result).toBe('João');
    });
    it('rejects single char', () => {
      expect(nameSchema.safeParse('A').success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
    });
    it('rejects missing password', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com' }).success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('accepts valid registration', () => {
      const data = { name: 'João', email: 'j@b.com', password: '12345678', company: 'ACME' };
      expect(registerSchema.safeParse(data).success).toBe(true);
    });
    it('rejects short password', () => {
      const data = { name: 'João', email: 'j@b.com', password: '123', company: 'ACME' };
      expect(registerSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('employeeSchema', () => {
    it('accepts minimal employee', () => {
      expect(employeeSchema.safeParse({ name: 'Maria' }).success).toBe(true);
    });
    it('accepts full employee', () => {
      const data = {
        name: 'Maria',
        email: 'm@co.com',
        phone: '+55 11 99999-0000',
        department: 'TI',
        position: 'Dev',
        status: 'active' as const,
        hire_date: '2024-01-15',
      };
      expect(employeeSchema.safeParse(data).success).toBe(true);
    });
    it('rejects invalid status', () => {
      expect(employeeSchema.safeParse({ name: 'Maria', status: 'fired' }).success).toBe(false);
    });
  });

  describe('geofenceSchema', () => {
    it('accepts valid geofence', () => {
      const data = { name: 'Escritório', latitude: -23.55, longitude: -46.63, radius_meters: 100 };
      expect(geofenceSchema.safeParse(data).success).toBe(true);
    });
    it('rejects lat out of range', () => {
      const data = { name: 'X', latitude: 91, longitude: 0, radius_meters: 100 };
      expect(geofenceSchema.safeParse(data).success).toBe(false);
    });
    it('rejects radius too small', () => {
      const data = { name: 'X', latitude: 0, longitude: 0, radius_meters: 5 };
      expect(geofenceSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('webhookSchema', () => {
    it('accepts valid webhook', () => {
      const data = { name: 'My Hook', url: 'https://example.com/hook', events: ['alert.created'] };
      expect(webhookSchema.safeParse(data).success).toBe(true);
    });
    it('rejects invalid URL', () => {
      const data = { name: 'My Hook', url: 'not-a-url', events: ['x'] };
      expect(webhookSchema.safeParse(data).success).toBe(false);
    });
    it('rejects empty events', () => {
      const data = { name: 'My Hook', url: 'https://x.com', events: [] };
      expect(webhookSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('alertRuleSchema', () => {
    it('accepts valid rule', () => {
      const data = { name: 'High CPU', severity: 'high', condition_type: 'threshold' };
      expect(alertRuleSchema.safeParse(data).success).toBe(true);
    });
    it('rejects invalid severity', () => {
      const data = { name: 'X', severity: 'extreme', condition_type: 'x' };
      expect(alertRuleSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('workScheduleSchema', () => {
    it('accepts valid schedule', () => {
      const data = { name: 'Comercial', start_time: '08:00', end_time: '17:00', days_of_week: [1, 2, 3, 4, 5] };
      expect(workScheduleSchema.safeParse(data).success).toBe(true);
    });
    it('rejects invalid time format', () => {
      const data = { name: 'X', start_time: '8am', end_time: '5pm', days_of_week: [1] };
      expect(workScheduleSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('reportSchema', () => {
    it('accepts valid report', () => {
      const data = {
        title: 'Relatório Mensal',
        type: 'productivity',
        date_range_start: '2024-01-01',
        date_range_end: '2024-01-31',
      };
      expect(reportSchema.safeParse(data).success).toBe(true);
    });
    it('rejects invalid type', () => {
      const data = {
        title: 'X',
        type: 'invalid',
        date_range_start: '2024-01-01',
        date_range_end: '2024-01-31',
      };
      expect(reportSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('securityPolicySchema', () => {
    it('accepts valid policy', () => {
      const data = { name: 'Password Policy', description: 'Require strong passwords for all users', category: 'auth' };
      expect(securityPolicySchema.safeParse(data).success).toBe(true);
    });
    it('rejects short description', () => {
      const data = { name: 'X Policy', description: 'Short', category: 'auth' };
      expect(securityPolicySchema.safeParse(data).success).toBe(false);
    });
  });

  describe('teamSchema', () => {
    it('accepts valid team', () => {
      expect(teamSchema.safeParse({ name: 'Engineering' }).success).toBe(true);
    });
  });
});
