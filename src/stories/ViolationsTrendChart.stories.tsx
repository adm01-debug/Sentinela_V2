import type { Meta, StoryObj } from '@storybook/react';
import { ViolationsTrendChart } from '@/components/ViolationsTrendChart';

const meta: Meta<typeof ViolationsTrendChart> = {
  title: 'Components/ViolationsTrendChart',
  component: ViolationsTrendChart,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ViolationsTrendChart>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
