import type { Meta, StoryObj } from '@storybook/react';
import { ReportFilters } from './ReportFilters';

const meta: Meta<typeof ReportFilters> = {
  title: 'Components/ReportFilters',
  component: ReportFilters,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportFilters>;

export const Default: Story = {};
