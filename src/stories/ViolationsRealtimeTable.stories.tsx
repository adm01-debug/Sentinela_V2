import type { Meta, StoryObj } from '@storybook/react';
import { ViolationsRealtimeTable } from '@/components/ViolationsRealtimeTable';

const meta: Meta<typeof ViolationsRealtimeTable> = {
  title: 'Components/ViolationsRealtimeTable',
  component: ViolationsRealtimeTable,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ViolationsRealtimeTable>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
