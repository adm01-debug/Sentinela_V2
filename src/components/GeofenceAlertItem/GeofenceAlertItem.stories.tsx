import type { Meta, StoryObj } from '@storybook/react';
import { GeofenceAlertItem } from './GeofenceAlertItem';

const meta: Meta<typeof GeofenceAlertItem> = {
  title: 'Components/GeofenceAlertItem',
  component: GeofenceAlertItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GeofenceAlertItem>;

export const Default: Story = {};
