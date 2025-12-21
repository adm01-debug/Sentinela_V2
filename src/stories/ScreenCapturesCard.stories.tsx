import type { Meta, StoryObj } from '@storybook/react';
import { ScreenCapturesCard } from '@/components/ScreenCapturesCard';

const meta: Meta<typeof ScreenCapturesCard> = {
  title: 'Components/ScreenCapturesCard',
  component: ScreenCapturesCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ScreenCapturesCard>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
