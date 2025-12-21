import type { Meta, StoryObj } from '@storybook/react';
import { RateLimitSettingsPanel } from '@/components/RateLimitSettingsPanel';

const meta: Meta<typeof RateLimitSettingsPanel> = {
  title: 'Components/RateLimitSettingsPanel',
  component: RateLimitSettingsPanel,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof RateLimitSettingsPanel>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
