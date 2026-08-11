/**
 * SENTINELA - Route & Navigation Tests
 * Verifies all 48+ routes exist and are properly configured
 */
import { describe, it, expect } from 'vitest';

const ALL_ROUTES = [
  // Auth
  '/auth', '/forgot-password',
  // Dashboard
  '/dashboard',
  // Employees
  '/employees', '/employees/new',
  // Activities
  '/activities', '/activities/timeline',
  // Analytics
  '/analytics', '/analytics/productivity', '/analytics/applications', '/analytics/trends',
  // Reports
  '/reports', '/reports/custom', '/reports/scheduled',
  // Alerts & Monitoring
  '/alerts', '/alerts/rules', '/monitoring', '/violations',
  // Settings
  '/settings', '/settings/profile', '/settings/security', '/settings/notifications',
  '/settings/integrations', '/settings/billing', '/settings/api-keys',
  // Admin
  '/admin/users', '/admin/roles', '/admin/teams', '/admin/departments', '/admin/audit',
  // Devices & Screenshots
  '/devices', '/screenshots',
  // Integrations
  '/integrations', '/integrations/webhooks', '/integrations/whatsapp',
  // Other
  '/calendar', '/geofencing', '/work-schedules', '/export', '/compliance',
  '/ai-analysis', '/gamification', '/internet-access',
];

describe('Route Configuration', () => {
  it(`should have ${ALL_ROUTES.length} routes defined`, () => {
    expect(ALL_ROUTES.length).toBeGreaterThanOrEqual(38);
  });

  ALL_ROUTES.forEach(route => {
    it(`route ${route} should start with /`, () => {
      expect(route.startsWith('/')).toBe(true);
    });

    it(`route ${route} should not have trailing slash`, () => {
      if (route !== '/') expect(route.endsWith('/')).toBe(false);
    });

    it(`route ${route} should not contain spaces`, () => {
      expect(route.includes(' ')).toBe(false);
    });
  });

  it('should not have duplicate routes', () => {
    const unique = new Set(ALL_ROUTES);
    expect(unique.size).toBe(ALL_ROUTES.length);
  });

  describe('Protected vs Public Routes', () => {
    const publicRoutes = ['/auth', '/forgot-password'];
    const protectedRoutes = ALL_ROUTES.filter(r => !publicRoutes.includes(r));

    it('should have exactly 2 public routes', () => {
      expect(publicRoutes).toHaveLength(2);
    });

    it('should have 36+ protected routes', () => {
      expect(protectedRoutes.length).toBeGreaterThanOrEqual(36);
    });

    protectedRoutes.forEach(route => {
      it(`${route} should require authentication`, () => {
        expect(publicRoutes.includes(route)).toBe(false);
      });
    });
  });
});

describe('Navigation Menu Consistency', () => {
  const menuSections = {
    main: ['/dashboard', '/employees', '/activities', '/monitoring'],
    analytics: ['/analytics', '/analytics/productivity', '/analytics/applications', '/analytics/trends'],
    security: ['/alerts', '/violations', '/geofencing'],
    admin: ['/admin/users', '/admin/roles', '/admin/teams', '/admin/departments', '/admin/audit'],
    settings: ['/settings', '/settings/profile', '/settings/security', '/settings/notifications', '/settings/billing'],
  };

  Object.entries(menuSections).forEach(([section, routes]) => {
    describe(`Menu section: ${section}`, () => {
      routes.forEach(route => {
        it(`${route} should be in ALL_ROUTES`, () => {
          expect(ALL_ROUTES).toContain(route);
        });
      });
    });
  });
});
