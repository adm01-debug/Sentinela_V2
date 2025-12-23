import type { Meta, StoryObj } from '@storybook/react';
import { ViolationStats } from './ViolationStats';

const meta: Meta<typeof ViolationStats> = {
  title: 'Components/ViolationStats',
  component: ViolationStats,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ViolationStats>;

export const Default: Story = {};
