import type { Meta, StoryObj } from '@storybook/react';
import { RealtimeKeystrokesCard } from '@/components/RealtimeKeystrokesCard';

const meta: Meta<typeof RealtimeKeystrokesCard> = {
  title: 'Components/RealtimeKeystrokesCard',
  component: RealtimeKeystrokesCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof RealtimeKeystrokesCard>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
