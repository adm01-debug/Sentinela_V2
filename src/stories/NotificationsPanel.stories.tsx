import type { Meta, StoryObj } from '@storybook/react';
import { NotificationsPanel } from '@/components/NotificationsPanel';

const meta: Meta<typeof NotificationsPanel> = {
  title: 'Components/NotificationsPanel',
  component: NotificationsPanel,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof NotificationsPanel>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
