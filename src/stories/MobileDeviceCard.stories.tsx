import type { Meta, StoryObj } from '@storybook/react';

const MobileDeviceCard = () => <div>MobileDeviceCard Component</div>;

const meta: Meta<typeof MobileDeviceCard> = {
  title: 'Components/Mobile/MobileDeviceCard',
  component: MobileDeviceCard,
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
