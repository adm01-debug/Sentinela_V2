import type { Meta, StoryObj } from '@storybook/react';
import { chart } from './chart';

const meta: Meta<typeof chart> = {
  title: 'UI/chart',
  component: chart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof chart>;

export const Default: Story = {};
