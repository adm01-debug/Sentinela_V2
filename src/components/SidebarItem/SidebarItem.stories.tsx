import type { Meta, StoryObj } from '@storybook/react';
import { SidebarItem } from './SidebarItem';

const meta: Meta<typeof SidebarItem> = {
  title: 'Components/SidebarItem',
  component: SidebarItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SidebarItem>;

export const Default: Story = {};
