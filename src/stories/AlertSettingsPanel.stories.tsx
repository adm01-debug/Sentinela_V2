import type { Meta, StoryObj } from '@storybook/react';

import { AlertSettingsPanel } from '@/components/AlertSettingsPanel';

const meta: Meta<typeof AlertSettingsPanel> = {
  title: 'Components/AlertSettingsPanel',
  component: AlertSettingsPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof AlertSettingsPanel>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
