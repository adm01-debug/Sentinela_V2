import type { Meta, StoryObj } from '@storybook/react';
import { PolicyCard } from './PolicyCard';

const meta: Meta<typeof PolicyCard> = {
  title: 'Components/PolicyCard',
  component: PolicyCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PolicyCard>;

export const Default: Story = {};
