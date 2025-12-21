export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  domain?: string;
  settings: OrganizationSettings;
  plan: string;
  createdAt: string;
}

export interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  language: string;
  features: string[];
}