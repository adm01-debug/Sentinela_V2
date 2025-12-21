import type { Meta, StoryObj } from '@storybook/react';
import { RealtimeActivityFilters } from '@/components/RealtimeActivityFilters';

const meta: Meta<typeof RealtimeActivityFilters> = {
  title: 'Components/RealtimeActivityFilters',
  component: RealtimeActivityFilters,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof RealtimeActivityFilters>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
