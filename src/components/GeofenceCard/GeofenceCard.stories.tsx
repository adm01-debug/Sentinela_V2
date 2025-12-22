import type { Meta, StoryObj } from '@storybook/react';
import { GeofenceCard } from './GeofenceCard';

const meta: Meta<typeof GeofenceCard> = {
  title: 'Components/GeofenceCard',
  component: GeofenceCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GeofenceCard>;

export const Default: Story = {};
