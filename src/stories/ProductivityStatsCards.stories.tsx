import type { Meta, StoryObj } from '@storybook/react';

const ProductivityStatsCards = () => <div>ProductivityStatsCards Component</div>;

const meta: Meta<typeof ProductivityStatsCards> = {
  title: 'Components/Productivity/ProductivityStatsCards',
  component: ProductivityStatsCards,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {},
};

export const Empty: Story = {
  args: {},
};

export const WithData: Story = {
  args: {},
};
