import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard } from '../components/ui/hover-card';

const meta: Meta<typeof HoverCard> = {
  title: 'UI/HoverCard',
  component: HoverCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
