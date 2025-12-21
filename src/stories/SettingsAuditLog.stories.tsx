import type { Meta, StoryObj } from '@storybook/react';
import { SettingsAuditLog } from '@/components/SettingsAuditLog';

const meta: Meta<typeof SettingsAuditLog> = {
  title: 'Components/SettingsAuditLog',
  component: SettingsAuditLog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SettingsAuditLog>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
