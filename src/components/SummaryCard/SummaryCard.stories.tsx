import type { Meta, StoryObj } from '@storybook/react';
import { SummaryCard } from './SummaryCard';

const meta: Meta<typeof SummaryCard> = {
  title: 'Components/SummaryCard',
  component: SummaryCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SummaryCard>;

export const Default: Story = {};
