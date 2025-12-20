import type { Meta, StoryObj } from '@storybook/react';

const AIStatsCards = () => <div>AIStatsCards Component</div>;

const meta: Meta<typeof AIStatsCards> = {
  title: 'Components/Ai/AIStatsCards',
  component: AIStatsCards,
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
