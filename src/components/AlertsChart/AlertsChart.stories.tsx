import type { Meta, StoryObj } from '@storybook/react';
import { AlertsChart } from './AlertsChart';

const meta: Meta<typeof AlertsChart> = {
  title: 'Components/AlertsChart',
  component: AlertsChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AlertsChart>;

export const Default: Story = {};
