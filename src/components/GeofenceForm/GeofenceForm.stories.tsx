import type { Meta, StoryObj } from '@storybook/react';
import { GeofenceForm } from './GeofenceForm';

const meta: Meta<typeof GeofenceForm> = {
  title: 'Components/GeofenceForm',
  component: GeofenceForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GeofenceForm>;

export const Default: Story = {};
