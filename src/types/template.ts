export interface Template {
  id: string;
  name: string;
  type: 'message' | 'email' | 'report' | 'policy';
  content: string;
  variables: TemplateVariable[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: string;
}

export interface TemplateUsage {
  templateId: string;
  usedAt: string;
  usedBy: string;
  variables: Record<string, unknown>;
}
