import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/150?u=1" />
      <AvatarFallback>JS</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>MS</AvatarFallback>
    </Avatar>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="flex gap-2">
      <Avatar><AvatarImage src="https://i.pravatar.cc/150?u=1" /><AvatarFallback>A</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/150?u=2" /><AvatarFallback>B</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/150?u=3" /><AvatarFallback>C</AvatarFallback></Avatar>
    </div>
  ),
};
