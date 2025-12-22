import type { Meta, StoryObj } from '@storybook/react';
import { DashboardCustomizer } from './DashboardCustomizer';

const meta: Meta<typeof DashboardCustomizer> = {
  title: 'Components/DashboardCustomizer',
  component: DashboardCustomizer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DashboardCustomizer>;

export const Default: Story = {};
