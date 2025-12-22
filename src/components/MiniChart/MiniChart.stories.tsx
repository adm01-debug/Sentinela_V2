import type { Meta, StoryObj } from '@storybook/react';
import { MiniChart } from './MiniChart';

const meta: Meta<typeof MiniChart> = {
  title: 'Components/MiniChart',
  component: MiniChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MiniChart>;

export const Default: Story = {};
