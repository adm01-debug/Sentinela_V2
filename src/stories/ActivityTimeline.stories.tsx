import type { Meta, StoryObj } from '@storybook/react';

import { ActivityTimeline } from '@/components/ActivityTimeline';

const meta: Meta<typeof ActivityTimeline> = {
  title: 'Components/ActivityTimeline',
  component: ActivityTimeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
