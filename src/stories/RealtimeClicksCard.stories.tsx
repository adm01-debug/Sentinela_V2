import type { Meta, StoryObj } from '@storybook/react';
import { RealtimeClicksCard } from '@/components/RealtimeClicksCard';

const meta: Meta<typeof RealtimeClicksCard> = {
  title: 'Components/RealtimeClicksCard',
  component: RealtimeClicksCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof RealtimeClicksCard>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
