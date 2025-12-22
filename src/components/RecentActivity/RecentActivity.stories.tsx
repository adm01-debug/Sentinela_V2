import type { Meta, StoryObj } from '@storybook/react';
import { RecentActivity } from './RecentActivity';

const meta: Meta<typeof RecentActivity> = {
  title: 'Components/RecentActivity',
  component: RecentActivity,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RecentActivity>;

export const Default: Story = {};
