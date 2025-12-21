import type { Meta, StoryObj } from '@storybook/react';
import { ViolationsByTypeChart } from '@/components/ViolationsByTypeChart';

const meta: Meta<typeof ViolationsByTypeChart> = {
  title: 'Components/ViolationsByTypeChart',
  component: ViolationsByTypeChart,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ViolationsByTypeChart>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
