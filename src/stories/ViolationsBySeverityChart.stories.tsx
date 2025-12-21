import type { Meta, StoryObj } from '@storybook/react';
import { ViolationsBySeverityChart } from '@/components/ViolationsBySeverityChart';

const meta: Meta<typeof ViolationsBySeverityChart> = {
  title: 'Components/ViolationsBySeverityChart',
  component: ViolationsBySeverityChart,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ViolationsBySeverityChart>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
