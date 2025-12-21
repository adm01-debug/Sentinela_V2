import type { Meta, StoryObj } from '@storybook/react';
import { TimeAgo } from '@/components/TimeAgo';

const meta: Meta<typeof TimeAgo> = {
  title: 'Components/TimeAgo',
  component: TimeAgo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof TimeAgo>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
