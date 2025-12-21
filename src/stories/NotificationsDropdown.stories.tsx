import type { Meta, StoryObj } from '@storybook/react';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';

const meta: Meta<typeof NotificationsDropdown> = {
  title: 'Components/NotificationsDropdown',
  component: NotificationsDropdown,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof NotificationsDropdown>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
