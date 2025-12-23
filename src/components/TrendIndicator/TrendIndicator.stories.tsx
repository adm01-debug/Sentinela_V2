import type { Meta, StoryObj } from '@storybook/react';
import { TrendIndicator } from './TrendIndicator';

const meta: Meta<typeof TrendIndicator> = {
  title: 'Components/TrendIndicator',
  component: TrendIndicator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TrendIndicator>;

export const Default: Story = {};
