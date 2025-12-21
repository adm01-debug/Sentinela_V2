export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: PlanLimits;
}

export interface PlanLimits {
  employees: number;
  storage: number;
  apiCalls: number;
  retention: number;
}

export interface Usage {
  employees: number;
  storage: number;
  apiCalls: number;
}