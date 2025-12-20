import type { Meta, StoryObj } from '@storybook/react';
import { GridList } from '@/components/ui/gridlist';

const meta: Meta<typeof GridList> = {
  title: 'UI/GridList',
  component: GridList,
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
