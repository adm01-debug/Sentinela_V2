import type { Meta, StoryObj } from '@storybook/react';
import { LiveActivityCard } from './LiveActivityCard';

const meta: Meta<typeof LiveActivityCard> = {
  title: 'Components/LiveActivityCard',
  component: LiveActivityCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LiveActivityCard>;

export const Default: Story = {};
