export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  size: WidgetSize;
  refreshInterval?: number;
}
export type WidgetType =
  | "stat"
  | "chart"
  | "list"
  | "table"
  | "map"
  | "calendar"
  | "activity"
  | "alerts"
  | "custom";
export interface WidgetConfig {
  dataSource: string;
  filters?: Record<string, string | number | boolean>;
  displayOptions?: Record<string, string | number | boolean>;
  actions?: WidgetAction[];
}
export interface WidgetSize {
  width: 1 | 2 | 3 | 4;
  height: 1 | 2 | 3;
}
export interface WidgetAction {
  type: "refresh" | "expand" | "edit" | "remove" | "export";
  handler?: () => void;
}
export interface WidgetData {
  loading: boolean;
  error?: string;
  data: unknown;
  lastUpdated: string;
}
export interface WidgetRegistry {
  type: WidgetType;
  component: React.ComponentType<Record<string, unknown>>;
  defaultConfig: Partial<WidgetConfig>;
  icon: string;
}
