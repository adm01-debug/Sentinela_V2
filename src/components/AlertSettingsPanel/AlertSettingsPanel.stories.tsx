import type { Meta, StoryObj } from '@storybook/react';
import { AlertSettingsPanel } from './AlertSettingsPanel';

const meta: Meta<typeof AlertSettingsPanel> = {
  title: 'Components/AlertSettingsPanel',
  component: AlertSettingsPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AlertSettingsPanel>;

export const Default: Story = {};
