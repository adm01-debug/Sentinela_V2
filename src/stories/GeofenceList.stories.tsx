import type { Meta, StoryObj } from '@storybook/react';

const GeofenceList = () => <div>GeofenceList Component</div>;

const meta: Meta<typeof GeofenceList> = {
  title: 'Components/Geofencing/GeofenceList',
  component: GeofenceList,
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
