import type { Meta, StoryObj } from '@storybook/react';
import { TopAppsChart } from './TopAppsChart';

const meta: Meta<typeof TopAppsChart> = {
  title: 'Components/TopAppsChart',
  component: TopAppsChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopAppsChart>;

export const Default: Story = {};
