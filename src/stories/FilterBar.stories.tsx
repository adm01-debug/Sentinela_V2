import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar } from '@/components/ui/filterbar';

const meta: Meta<typeof FilterBar> = {
  title: 'UI/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithProps: Story = {
  args: {},
};
