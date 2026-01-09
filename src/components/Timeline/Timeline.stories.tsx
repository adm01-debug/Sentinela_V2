import type { Meta, StoryObj } from '@storybook/react';
import { Timeline, TimelineItem } from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <TimelineItem title="Event 1" time="10:00 AM">First event description</TimelineItem>
        <TimelineItem title="Event 2" time="11:30 AM">Second event description</TimelineItem>
        <TimelineItem title="Event 3" time="2:00 PM">Third event description</TimelineItem>
      </>
    ),
  },
};
export const WithIcons: Story = {
  args: {
    children: (
      <>
        <TimelineItem title="Created" icon="📝" color="blue">Document created</TimelineItem>
        <TimelineItem title="Updated" icon="✏️" color="yellow">Content updated</TimelineItem>
        <TimelineItem title="Published" icon="✅" color="green">Published to production</TimelineItem>
      </>
    ),
  },
};
export const Alternate: Story = { args: { ...Default.args, mode: 'alternate' } };
