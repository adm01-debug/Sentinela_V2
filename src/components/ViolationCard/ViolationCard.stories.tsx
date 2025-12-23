import type { Meta, StoryObj } from '@storybook/react';
import { ViolationCard } from './ViolationCard';

const meta: Meta<typeof ViolationCard> = {
  title: 'Components/ViolationCard',
  component: ViolationCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ViolationCard>;

export const Default: Story = {};
