// ============================================================
// SCHEMAS DE VALIDAÇÃO PARA EDGE FUNCTIONS
// Usando Zod para validação de tipos em runtime
// ============================================================

// Nota: Em Edge Functions do Supabase, usamos validação manual
// pois Zod aumenta muito o bundle. Estes são os schemas de referência.

export interface AgentDataSchema {
  device_id: string;
  employee_id?: string;
  agent_key: string;
  data_type: 'activity' | 'screenshot' | 'keystroke' | 'application' | 'heartbeat';
  timestamp: string;
  
  // Activity data
  active_window?: string;
  active_application?: string;
  idle_time?: number;
  
  // Screenshot data
  screenshot_base64?: string;
  
  // Keystroke data
  keystroke_count?: number;
  click_count?: number;
  
  // Application data
  applications?: Array<{
    name: string;
    title: string;
    duration: number;
    category?: string;
  }>;
  
  // Location data
  latitude?: number;
  longitude?: number;
}

export interface MobileDataSchema {
  device_id: string;
  device_name: string;
  platform: 'android' | 'ios';
  data_type: 'location' | 'app_usage' | 'battery' | 'connectivity';
  timestamp: string;
  
  // Location
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  
  // App usage
  foreground_app?: string;
  screen_time?: number;
  
  // Battery
  battery_level?: number;
  is_charging?: boolean;
  
  // Connectivity
  connection_type?: 'wifi' | 'cellular' | 'none';
  ip_address?: string;
}

export interface WhatsAppMessageSchema {
  to: string;
  template_id?: string;
  message?: string;
  variables?: Record<string, string>;
}

export interface WebhookPayloadSchema {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface ViolationAlertSchema {
  violation_id: string;
  employee_id: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, unknown>;
  notify_channels?: Array<'email' | 'whatsapp' | 'webhook' | 'push'>;
}

// ============================================================
// FUNÇÕES DE VALIDAÇÃO MANUAL (para Edge Functions)
// ============================================================

export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Campo obrigatório: ${fieldName}`);
  }
}

export function validateString(value: unknown, fieldName: string, minLength = 0, maxLength = 10000): string {
  validateRequired(value, fieldName);
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} deve ser uma string`);
  }
  if (value.length < minLength) {
    throw new Error(`${fieldName} deve ter pelo menos ${minLength} caracteres`);
  }
  if (value.length > maxLength) {
    throw new Error(`${fieldName} deve ter no máximo ${maxLength} caracteres`);
  }
  return value;
}

export function validateNumber(value: unknown, fieldName: string, min?: number, max?: number): number {
  validateRequired(value, fieldName);
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof num !== 'number' || isNaN(num)) {
    throw new Error(`${fieldName} deve ser um número`);
  }
  if (min !== undefined && num < min) {
    throw new Error(`${fieldName} deve ser pelo menos ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new Error(`${fieldName} deve ser no máximo ${max}`);
  }
  return num;
}

export function validateEnum<T extends string>(value: unknown, fieldName: string, allowedValues: T[]): T {
  validateRequired(value, fieldName);
  if (!allowedValues.includes(value as T)) {
    throw new Error(`${fieldName} deve ser um dos valores: ${allowedValues.join(', ')}`);
  }
  return value as T;
}

export function validateEmail(value: unknown, fieldName: string): string {
  const str = validateString(value, fieldName);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(str)) {
    throw new Error(`${fieldName} deve ser um email válido`);
  }
  return str;
}

export function validatePhone(value: unknown, fieldName: string): string {
  const str = validateString(value, fieldName);
  const phoneRegex = /^\+?[1-9]\d{10,14}$/;
  if (!phoneRegex.test(str.replace(/[\s-()]/g, ''))) {
    throw new Error(`${fieldName} deve ser um telefone válido`);
  }
  return str;
}

export function validateUUID(value: unknown, fieldName: string): string {
  const str = validateString(value, fieldName);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(str)) {
    throw new Error(`${fieldName} deve ser um UUID válido`);
  }
  return str;
}

export function validateISO8601(value: unknown, fieldName: string): string {
  const str = validateString(value, fieldName);
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error(`${fieldName} deve ser uma data ISO 8601 válida`);
  }
  return str;
}

export function validateOptional<T>(
  value: unknown, 
  validator: (v: unknown, f: string) => T,
  fieldName: string
): T | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return validator(value, fieldName);
}

export function validateArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator: (item: unknown, index: number) => T,
  minLength = 0,
  maxLength = 1000
): T[] {
  validateRequired(value, fieldName);
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} deve ser um array`);
  }
  if (value.length < minLength) {
    throw new Error(`${fieldName} deve ter pelo menos ${minLength} itens`);
  }
  if (value.length > maxLength) {
    throw new Error(`${fieldName} deve ter no máximo ${maxLength} itens`);
  }
  return value.map((item, index) => itemValidator(item, index));
}

// ============================================================
// VALIDADORES ESPECÍFICOS PARA CADA EDGE FUNCTION
// ============================================================

export function validateAgentData(data: unknown): AgentDataSchema {
  if (!data || typeof data !== 'object') {
    throw new Error('Dados inválidos');
  }
  const obj = data as Record<string, unknown>;
  
  return {
    device_id: validateString(obj.device_id, 'device_id', 1, 100),
    employee_id: validateOptional(obj.employee_id, validateUUID, 'employee_id'),
    agent_key: validateString(obj.agent_key, 'agent_key', 10, 200),
    data_type: validateEnum(obj.data_type, 'data_type', ['activity', 'screenshot', 'keystroke', 'application', 'heartbeat']),
    timestamp: validateISO8601(obj.timestamp, 'timestamp'),
    active_window: validateOptional(obj.active_window, (v, f) => validateString(v, f, 0, 500), 'active_window'),
    active_application: validateOptional(obj.active_application, (v, f) => validateString(v, f, 0, 200), 'active_application'),
    idle_time: validateOptional(obj.idle_time, (v, f) => validateNumber(v, f, 0), 'idle_time'),
    keystroke_count: validateOptional(obj.keystroke_count, (v, f) => validateNumber(v, f, 0), 'keystroke_count'),
    click_count: validateOptional(obj.click_count, (v, f) => validateNumber(v, f, 0), 'click_count'),
    latitude: validateOptional(obj.latitude, (v, f) => validateNumber(v, f, -90, 90), 'latitude'),
    longitude: validateOptional(obj.longitude, (v, f) => validateNumber(v, f, -180, 180), 'longitude'),
  };
}

export function validateMobileData(data: unknown): MobileDataSchema {
  if (!data || typeof data !== 'object') {
    throw new Error('Dados inválidos');
  }
  const obj = data as Record<string, unknown>;
  
  return {
    device_id: validateString(obj.device_id, 'device_id', 1, 100),
    device_name: validateString(obj.device_name, 'device_name', 1, 200),
    platform: validateEnum(obj.platform, 'platform', ['android', 'ios']),
    data_type: validateEnum(obj.data_type, 'data_type', ['location', 'app_usage', 'battery', 'connectivity']),
    timestamp: validateISO8601(obj.timestamp, 'timestamp'),
    latitude: validateOptional(obj.latitude, (v, f) => validateNumber(v, f, -90, 90), 'latitude'),
    longitude: validateOptional(obj.longitude, (v, f) => validateNumber(v, f, -180, 180), 'longitude'),
    accuracy: validateOptional(obj.accuracy, (v, f) => validateNumber(v, f, 0), 'accuracy'),
    battery_level: validateOptional(obj.battery_level, (v, f) => validateNumber(v, f, 0, 100), 'battery_level'),
  };
}

export function validateWhatsAppMessage(data: unknown): WhatsAppMessageSchema {
  if (!data || typeof data !== 'object') {
    throw new Error('Dados inválidos');
  }
  const obj = data as Record<string, unknown>;
  
  return {
    to: validatePhone(obj.to, 'to'),
    template_id: validateOptional(obj.template_id, validateString, 'template_id'),
    message: validateOptional(obj.message, (v, f) => validateString(v, f, 1, 4096), 'message'),
    variables: obj.variables as Record<string, string> | undefined,
  };
}

export function validateViolationAlert(data: unknown): ViolationAlertSchema {
  if (!data || typeof data !== 'object') {
    throw new Error('Dados inválidos');
  }
  const obj = data as Record<string, unknown>;
  
  return {
    violation_id: validateUUID(obj.violation_id, 'violation_id'),
    employee_id: validateUUID(obj.employee_id, 'employee_id'),
    violation_type: validateString(obj.violation_type, 'violation_type', 1, 100),
    severity: validateEnum(obj.severity, 'severity', ['low', 'medium', 'high', 'critical']),
    details: obj.details as Record<string, unknown> | undefined,
    notify_channels: validateOptional(
      obj.notify_channels,
      (v, f) => validateArray(v, f, (item) => validateEnum(item, 'channel', ['email', 'whatsapp', 'webhook', 'push'])),
      'notify_channels'
    ),
  };
}
