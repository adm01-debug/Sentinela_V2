import type { Meta, StoryObj } from '@storybook/react';
import { TimelineItem } from './TimelineItem';

const meta: Meta<typeof TimelineItem> = {
  title: 'Components/TimelineItem',
  component: TimelineItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimelineItem>;

export const Default: Story = {};
