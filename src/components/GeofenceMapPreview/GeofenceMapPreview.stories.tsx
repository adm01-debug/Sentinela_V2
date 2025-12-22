import type { Meta, StoryObj } from '@storybook/react';
import { GeofenceMapPreview } from './GeofenceMapPreview';

const meta: Meta<typeof GeofenceMapPreview> = {
  title: 'Components/GeofenceMapPreview',
  component: GeofenceMapPreview,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GeofenceMapPreview>;

export const Default: Story = {};
