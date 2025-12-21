import type { Meta, StoryObj } from '@storybook/react';
import { VirtualizedTable } from '@/components/VirtualizedTable';

const meta: Meta<typeof VirtualizedTable> = {
  title: 'Components/VirtualizedTable',
  component: VirtualizedTable,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof VirtualizedTable>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
