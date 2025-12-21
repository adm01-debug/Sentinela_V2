import type { Meta, StoryObj } from '@storybook/react';
import { ViolationsByEmployeeChart } from '@/components/ViolationsByEmployeeChart';

const meta: Meta<typeof ViolationsByEmployeeChart> = {
  title: 'Components/ViolationsByEmployeeChart',
  component: ViolationsByEmployeeChart,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ViolationsByEmployeeChart>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
