export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  department?: string;
  teamIds: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface UserProfile extends User {
  phone?: string;
  timezone: string;
  language: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  twoFactorEnabled: boolean;
  darkMode: boolean;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: User['role'];
  teamIds?: string[];
}
