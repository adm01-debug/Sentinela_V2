/**
 * Auth Types
 * Core type definitions for authentication and authorization
 */

import type { User } from '@supabase/supabase-js';

export type AuthProvider = 'email' | 'google' | 'github' | 'microsoft' | 'saml' | 'oidc';
export type MFAMethod = 'totp' | 'sms' | 'email' | 'webauthn';
export type SessionStatus = 'active' | 'expired' | 'revoked';

export interface AuthUser extends Omit<User, 'app_metadata' | 'user_metadata'> {
  full_name?: string;
  avatar_url?: string;
  organization_id?: string;
  role?: UserRole;
  permissions?: string[];
  mfa_enabled?: boolean;
  last_sign_in_at?: string;
}

export type UserRole = 
  | 'super_admin'
  | 'org_admin'
  | 'admin'
  | 'manager'
  | 'supervisor'
  | 'user'
  | 'viewer'
  | 'guest';

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
  device_id?: string;
  ip_address?: string;
  user_agent?: string;
  location?: SessionLocation;
}

export interface SessionLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  full_name: string;
  organization_name?: string;
  invite_code?: string;
}

export interface SignInOptions {
  rememberMe?: boolean;
  deviceId?: string;
  captchaToken?: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  session: AuthSession | null;
  error: AuthError | null;
  mfa_required?: boolean;
  mfa_challenge_id?: string;
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'user_not_found'
  | 'email_not_verified'
  | 'account_disabled'
  | 'account_locked'
  | 'mfa_required'
  | 'mfa_invalid'
  | 'password_too_weak'
  | 'email_already_registered'
  | 'invalid_token'
  | 'token_expired'
  | 'rate_limited'
  | 'server_error';

// MFA Types
export interface MFAConfig {
  enabled: boolean;
  methods: MFAMethod[];
  required_for_roles?: UserRole[];
  remember_device_days?: number;
}

export interface MFAEnrollment {
  id: string;
  user_id: string;
  method: MFAMethod;
  is_verified: boolean;
  is_primary: boolean;
  phone_number?: string;
  totp_secret?: string;
  webauthn_credential_id?: string;
  created_at: string;
  verified_at?: string;
}

export interface MFAChallenge {
  id: string;
  method: MFAMethod;
  expires_at: string;
  attempts_remaining: number;
}

export interface MFAVerification {
  challenge_id: string;
  code?: string;
  webauthn_response?: WebAuthnResponse;
  remember_device?: boolean;
}

export interface WebAuthnResponse {
  id: string;
  rawId: string;
  type: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string;
  };
}

// Permission Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: PermissionAction;
  conditions?: PermissionCondition[];
}

export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'export'
  | 'import'
  | '*';

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: unknown;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions: string[];
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

// Session Management
export interface UserSession {
  id: string;
  user_id: string;
  device_id?: string;
  device_name?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  ip_address?: string;
  location?: SessionLocation;
  status: SessionStatus;
  is_current?: boolean;
  last_active_at: string;
  created_at: string;
  expires_at: string;
}

export interface SessionFilters {
  user_id?: string;
  status?: SessionStatus;
  device_type?: string;
  date_from?: string;
  date_to?: string;
}

// Password Reset
export interface PasswordResetRequest {
  email: string;
  redirect_url?: string;
  captcha_token?: string;
}

export interface PasswordReset {
  token: string;
  new_password: string;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special: boolean;
  max_age_days?: number;
  prevent_reuse_count?: number;
}

// Invite Types
export interface UserInvite {
  id: string;
  email: string;
  role: UserRole;
  team_id?: string;
  department?: string;
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  organization_id: string;
  created_at: string;
}

export interface InviteCreateInput {
  email: string;
  role: UserRole;
  team_id?: string;
  department?: string;
  organization_id: string;
  invited_by: string;
}

// Audit Types
export interface AuthAuditLog {
  id: string;
  user_id?: string;
  event: AuthAuditEvent;
  ip_address?: string;
  user_agent?: string;
  location?: SessionLocation;
  metadata?: Record<string, unknown>;
  success: boolean;
  failure_reason?: string;
  created_at: string;
}

export type AuthAuditEvent =
  | 'sign_in'
  | 'sign_out'
  | 'sign_up'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'password_change'
  | 'mfa_enable'
  | 'mfa_disable'
  | 'mfa_verify'
  | 'session_revoke'
  | 'role_change'
  | 'permission_change'
  | 'account_lock'
  | 'account_unlock';

// Provider Config Types
export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc';
  is_enabled: boolean;
  config: SSOProviderConfig;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface SSOProviderConfig {
  client_id?: string;
  client_secret?: string;
  issuer_url?: string;
  metadata_url?: string;
  certificate?: string;
  redirect_uri?: string;
  scopes?: string[];
  attribute_mapping?: Record<string, string>;
}
