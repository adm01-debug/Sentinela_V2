import type { Meta, StoryObj } from '@storybook/react';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

const meta: Meta<typeof PWAInstallPrompt> = {
  title: 'Components/PWAInstallPrompt',
  component: PWAInstallPrompt,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof PWAInstallPrompt>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
