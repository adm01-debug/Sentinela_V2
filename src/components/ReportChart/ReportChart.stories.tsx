import type { Meta, StoryObj } from '@storybook/react';
import { ReportChart } from './ReportChart';

const meta: Meta<typeof ReportChart> = {
  title: 'Components/ReportChart',
  component: ReportChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportChart>;

export const Default: Story = {};
