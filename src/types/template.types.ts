export interface Template { id: string; name: string; description?: string; type: TemplateType; content: string; variables: TemplateVariable[]; isActive: boolean; isDefault?: boolean; category?: string; createdAt: string; updatedAt: string; }
export type TemplateType = 'email' | 'notification' | 'report' | 'document' | 'message' | 'webhook';
export interface TemplateVariable { name: string; type: VariableType; required: boolean; defaultValue?: string | number | boolean; description?: string; }
export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
export interface TemplateRender { templateId: string; variables: Record<string, string | number | boolean>; format?: 'html' | 'text' | 'pdf'; }
export interface TemplatePreview { content: string; format: string; variables: Record<string, string | number | boolean>; }
