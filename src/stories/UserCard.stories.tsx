import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from '@/components/users/UserCard';

const meta: Meta<typeof UserCard> = {
  title: 'Components/Users/UserCard',
  component: UserCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Admin: Story = {
  args: {
    user: {
      id: '1',
      email: 'admin@empresa.com',
      name: 'Administrador Sistema',
      role: 'admin',
      is_active: true,
      last_login_at: new Date().toISOString(),
      avatar_url: null,
      mfa_enabled: true,
    },
    onEdit: () => {},
    onResetPassword: () => {},
    onToggleStatus: () => {},
  },
};

export const Manager: Story = {
  args: {
    user: {
      id: '2',
      email: 'gerente@empresa.com',
      name: 'Maria Gerente',
      role: 'manager',
      is_active: true,
      last_login_at: new Date().toISOString(),
      avatar_url: 'https://i.pravatar.cc/150?u=maria',
      mfa_enabled: false,
    },
    onEdit: () => {},
    onResetPassword: () => {},
    onToggleStatus: () => {},
  },
};

export const Inactive: Story = {
  args: {
    user: {
      id: '3',
      email: 'antigo@empresa.com',
      name: 'Usuário Antigo',
      role: 'viewer',
      is_active: false,
      last_login_at: '2023-06-01T00:00:00Z',
      avatar_url: null,
      mfa_enabled: false,
    },
    onEdit: () => {},
    onResetPassword: () => {},
    onToggleStatus: () => {},
  },
};
