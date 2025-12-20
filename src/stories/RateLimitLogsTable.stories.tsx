import type { Meta, StoryObj } from '@storybook/react';
import { RateLimitLogsTable } from '@/components/rate-limit/RateLimitLogsTable';

const meta: Meta<typeof RateLimitLogsTable> = {
  title: 'Components/RateLimit/RateLimitLogsTable',
  component: RateLimitLogsTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logs: [
      { id: '1', ip_address: '192.168.1.1', endpoint: '/api/users', method: 'GET', status: 200, blocked: false, created_at: new Date().toISOString() },
      { id: '2', ip_address: '10.0.0.5', endpoint: '/api/login', method: 'POST', status: 429, blocked: true, created_at: new Date().toISOString() },
      { id: '3', ip_address: '172.16.0.10', endpoint: '/api/data', method: 'GET', status: 200, blocked: false, created_at: new Date().toISOString() },
    ],
  },
};

export const AllBlocked: Story = {
  args: {
    logs: [
      { id: '1', ip_address: '192.168.1.100', endpoint: '/api/login', method: 'POST', status: 429, blocked: true, created_at: new Date().toISOString() },
      { id: '2', ip_address: '192.168.1.100', endpoint: '/api/login', method: 'POST', status: 429, blocked: true, created_at: new Date().toISOString() },
    ],
  },
};

export const Empty: Story = {
  args: {
    logs: [],
  },
};
