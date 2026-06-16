/**
 * Application constants
 */

// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const API_TIMEOUT = 30000;

// Auth
export const AUTH_TOKEN_KEY = "sentinela_auth_token";
export const AUTH_REFRESH_KEY = "sentinela_refresh_token";
export const AUTH_USER_KEY = "sentinela_user";
export const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// Date
export const DATE_FORMAT = "dd/MM/yyyy";
export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";
export const TIME_FORMAT = "HH:mm";

// Violation severities
export const VIOLATION_SEVERITIES = {
  LOW: { value: "low", label: "Baixa", color: "green" },
  MEDIUM: { value: "medium", label: "Média", color: "yellow" },
  HIGH: { value: "high", label: "Alta", color: "red" },
} as const;

// Violation statuses
export const VIOLATION_STATUSES = {
  PENDING: { value: "pending", label: "Pendente", color: "gray" },
  UNDER_REVIEW: { value: "under_review", label: "Em Análise", color: "blue" },
  RESOLVED: { value: "resolved", label: "Resolvida", color: "green" },
  DISMISSED: { value: "dismissed", label: "Descartada", color: "gray" },
} as const;

// Employee statuses
export const EMPLOYEE_STATUSES = {
  ACTIVE: { value: "active", label: "Ativo", color: "green" },
  INACTIVE: { value: "inactive", label: "Inativo", color: "gray" },
  ON_LEAVE: { value: "on_leave", label: "De Licença", color: "yellow" },
} as const;

// Departments
export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Customer Success",
  "Human Resources",
  "Finance",
  "Operations",
  "Legal",
] as const;

// Report types
export const REPORT_TYPES = [
  { value: "productivity", label: "Produtividade" },
  { value: "violations", label: "Violações" },
  { value: "attendance", label: "Presença" },
  { value: "summary", label: "Resumo Executivo" },
] as const;

// Export formats
export const EXPORT_FORMATS = [
  { value: "pdf", label: "PDF", icon: "📄" },
  { value: "csv", label: "CSV", icon: "📊" },
  { value: "xlsx", label: "Excel", icon: "📈" },
] as const;

// Theme
export const THEME_KEY = "sentinela_theme";
export const THEMES = ["light", "dark", "system"] as const;

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  EMPLOYEES: "/employees",
  VIOLATIONS: "/violations",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEARCH: ["/", "ctrl+k", "cmd+k"],
  NEW: ["n", "ctrl+n", "cmd+n"],
  SAVE: ["ctrl+s", "cmd+s"],
  CLOSE: ["Escape"],
  HELP: ["?", "F1"],
} as const;
