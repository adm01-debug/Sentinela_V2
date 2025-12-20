import type { Meta, StoryObj } from '@storybook/react';
import { RecentViolations } from '@/components/dashboard/RecentViolations';

const meta: Meta<typeof RecentViolations> = {
  title: 'Components/Dashboard/RecentViolations',
  component: RecentViolations,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    violations: [
      { id: '1', employee_name: 'João Silva', type: 'Site bloqueado', severity: 'medium', created_at: new Date().toISOString() },
      { id: '2', employee_name: 'Maria Santos', type: 'Horário irregular', severity: 'low', created_at: new Date().toISOString() },
      { id: '3', employee_name: 'Carlos Lima', type: 'Acesso não autorizado', severity: 'high', created_at: new Date().toISOString() },
    ],
  },
};

export const Critical: Story = {
  args: {
    violations: [
      { id: '1', employee_name: 'Hacker', type: 'Tentativa de invasão', severity: 'critical', created_at: new Date().toISOString() },
      { id: '2', employee_name: 'Suspeito', type: 'Exfiltração de dados', severity: 'critical', created_at: new Date().toISOString() },
    ],
  },
};

export const Empty: Story = {
  args: {
    violations: [],
  },
};
