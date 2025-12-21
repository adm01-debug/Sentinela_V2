import type { Meta, StoryObj } from '@storybook/react';
import { PermissionGate } from '@/components/PermissionGate';

const meta: Meta<typeof PermissionGate> = {
  title: 'Components/PermissionGate',
  component: PermissionGate,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof PermissionGate>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
