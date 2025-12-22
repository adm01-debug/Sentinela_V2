import type { Meta, StoryObj } from '@storybook/react';
import { ActivityTimeline } from './ActivityTimeline';

const meta: Meta<typeof ActivityTimeline> = {
  title: 'Components/ActivityTimeline',
  component: ActivityTimeline,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

export const Default: Story = {};
