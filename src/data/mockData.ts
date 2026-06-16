// Mock data types for Sentinela components

export interface Alert {
  id: string;
  type:
    | "print_attempt"
    | "usb_blocked"
    | "external_hd"
    | "suspicious_activity"
    | "unauthorized_app";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  employeeName: string;
  device: string;
  timestamp: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  avatar: string;
  status: "online" | "offline" | "idle";
  lastActivity: string;
  device: "desktop" | "mobile";
  productivityScore: number;
}
