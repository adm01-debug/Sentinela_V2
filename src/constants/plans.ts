export const PLANS = {
  FREE: { id: 'free', name: 'Free', price: 0, employees: 5, features: ['activity_tracking'] },
  STARTER: { id: 'starter', name: 'Starter', price: 29, employees: 25, features: ['activity_tracking', 'screenshots', 'reports'] },
  PROFESSIONAL: { id: 'professional', name: 'Professional', price: 79, employees: 100, features: ['activity_tracking', 'screenshots', 'reports', 'geofencing', 'integrations'] },
  ENTERPRISE: { id: 'enterprise', name: 'Enterprise', price: 199, employees: -1, features: ['activity_tracking', 'screenshots', 'reports', 'geofencing', 'integrations', 'ai_insights', 'custom_alerts'] },
};
