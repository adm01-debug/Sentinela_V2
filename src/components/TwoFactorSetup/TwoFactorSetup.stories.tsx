import type { Meta, StoryObj } from '@storybook/react';
import { TwoFactorSetup } from './TwoFactorSetup';

const meta: Meta<typeof TwoFactorSetup> = {
  title: 'Components/TwoFactorSetup',
  component: TwoFactorSetup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TwoFactorSetup>;

export const Default: Story = {};
