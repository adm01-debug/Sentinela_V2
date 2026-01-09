import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = { args: { src: 'https://i.pravatar.cc/150?img=1', alt: 'User' } };
export const WithInitials: Story = { args: { name: 'John Doe' } };
export const Small: Story = { args: { name: 'JD', size: 'sm' } };
export const Large: Story = { args: { name: 'JD', size: 'lg' } };
export const WithStatus: Story = { args: { name: 'JD', status: 'online' } };
export const Offline: Story = { args: { name: 'JD', status: 'offline' } };
export const Busy: Story = { args: { name: 'JD', status: 'busy' } };
export const Group: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar name="A" /><Avatar name="B" /><Avatar name="C" /><Avatar name="D" />
    </AvatarGroup>
  ),
};
