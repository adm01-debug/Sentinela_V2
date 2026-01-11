// Email Service for Sentinela v17
import { api } from './api';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

interface SendEmailInput {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: { filename: string; content: string; contentType: string }[];
  templateId?: string;
  templateData?: Record<string, unknown>;
  replyTo?: string;
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: string;
}

interface EmailLog {
  id: string;
  to: string[];
  subject: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  opens: number;
  clicks: number;
  createdAt: string;
}

interface EmailStats {
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  openRate: number;
  clickRate: number;
}

const BASE_URL = '/email';

export const emailService = {
  async send(data: SendEmailInput): Promise<{ messageId: string }> {
    return api.post(`${BASE_URL}/send`, data);
  },

  async sendBulk(recipients: string[], templateId: string, data?: Record<string, unknown>): Promise<{ count: number; messageIds: string[] }> {
    return api.post(`${BASE_URL}/send-bulk`, { recipients, templateId, data });
  },

  async getTemplates(): Promise<EmailTemplate[]> {
    return api.get(`${BASE_URL}/templates`);
  },

  async getTemplate(id: string): Promise<EmailTemplate> {
    return api.get(`${BASE_URL}/templates/${id}`);
  },

  async createTemplate(data: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    return api.post(`${BASE_URL}/templates`, data);
  },

  async updateTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return api.put(`${BASE_URL}/templates/${id}`, data);
  },

  async deleteTemplate(id: string): Promise<void> {
    return api.delete(`${BASE_URL}/templates/${id}`);
  },

  async previewTemplate(id: string, data: Record<string, unknown>): Promise<{ subject: string; body: string }> {
    return api.post(`${BASE_URL}/templates/${id}/preview`, data);
  },

  async getLogs(page = 1, pageSize = 50): Promise<{ data: EmailLog[]; total: number }> {
    return api.get(`${BASE_URL}/logs?page=${page}&pageSize=${pageSize}`);
  },

  async getLog(id: string): Promise<EmailLog> {
    return api.get(`${BASE_URL}/logs/${id}`);
  },

  async getStats(startDate?: string, endDate?: string): Promise<EmailStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`${BASE_URL}/stats?${params}`);
  },

  async resend(logId: string): Promise<{ messageId: string }> {
    return api.post(`${BASE_URL}/logs/${logId}/resend`);
  },

  async cancelScheduled(messageId: string): Promise<void> {
    return api.post(`${BASE_URL}/cancel/${messageId}`);
  },

  async verifyDomain(domain: string): Promise<{ verified: boolean; records: Record<string, string>[] }> {
    return api.post(`${BASE_URL}/verify-domain`, { domain });
  },
};

export default emailService;
