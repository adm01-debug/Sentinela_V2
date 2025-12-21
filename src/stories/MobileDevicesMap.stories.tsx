import type { Meta, StoryObj } from '@storybook/react';
import { MobileDevicesMap } from '@/components/MobileDevicesMap';

const meta: Meta<typeof MobileDevicesMap> = {
  title: 'Components/MobileDevicesMap',
  component: MobileDevicesMap,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof MobileDevicesMap>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
