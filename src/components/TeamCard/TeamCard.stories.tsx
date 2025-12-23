import type { Meta, StoryObj } from '@storybook/react';
import { TeamCard } from './TeamCard';

const meta: Meta<typeof TeamCard> = {
  title: 'Components/TeamCard',
  component: TeamCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TeamCard>;

export const Default: Story = {};
