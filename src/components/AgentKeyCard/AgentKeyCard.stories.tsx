import type { Meta, StoryObj } from '@storybook/react';
import { AgentKeyCard } from './AgentKeyCard';

const meta: Meta<typeof AgentKeyCard> = {
  title: 'Components/AgentKeyCard',
  component: AgentKeyCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AgentKeyCard>;

export const Default: Story = {};
