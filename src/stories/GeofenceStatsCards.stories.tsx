import type { Meta, StoryObj } from '@storybook/react';

const GeofenceStatsCards = () => <div>GeofenceStatsCards Component</div>;

const meta: Meta<typeof GeofenceStatsCards> = {
  title: 'Components/Geofencing/GeofenceStatsCards',
  component: GeofenceStatsCards,
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
