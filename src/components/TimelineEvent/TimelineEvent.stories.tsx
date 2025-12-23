import type { Meta, StoryObj } from '@storybook/react';
import { TimelineEvent } from './TimelineEvent';

const meta: Meta<typeof TimelineEvent> = {
  title: 'Components/TimelineEvent',
  component: TimelineEvent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimelineEvent>;

export const Default: Story = {};
