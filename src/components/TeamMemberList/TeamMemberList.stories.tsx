import type { Meta, StoryObj } from '@storybook/react';
import { TeamMemberList } from './TeamMemberList';

const meta: Meta<typeof TeamMemberList> = {
  title: 'Components/TeamMemberList',
  component: TeamMemberList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TeamMemberList>;

export const Default: Story = {};
