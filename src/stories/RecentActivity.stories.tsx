import type { Meta, StoryObj } from '@storybook/react';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

const meta: Meta<typeof RecentActivity> = {
  title: 'Components/Dashboard/RecentActivity',
  component: RecentActivity,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activities: [
      { id: '1', type: 'login', description: 'João Silva fez login', created_at: new Date().toISOString() },
      { id: '2', type: 'report', description: 'Relatório mensal gerado', created_at: new Date().toISOString() },
      { id: '3', type: 'config', description: 'Configurações atualizadas', created_at: new Date().toISOString() },
    ],
  },
};

export const Busy: Story = {
  args: {
    activities: [
      { id: '1', type: 'login', description: 'Admin logou', created_at: new Date().toISOString() },
      { id: '2', type: 'create', description: 'Novo funcionário criado', created_at: new Date().toISOString() },
      { id: '3', type: 'update', description: 'Política atualizada', created_at: new Date().toISOString() },
      { id: '4', type: 'delete', description: 'Dispositivo removido', created_at: new Date().toISOString() },
      { id: '5', type: 'export', description: 'Dados exportados', created_at: new Date().toISOString() },
    ],
  },
};

export const Empty: Story = {
  args: {
    activities: [],
  },
};
