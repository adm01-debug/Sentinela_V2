import type { Meta, StoryObj } from '@storybook/react';
import { SidebarMenu } from '@/components/ui/sidebarmenu';

const meta: Meta<typeof SidebarMenu> = {
  title: 'UI/SidebarMenu',
  component: SidebarMenu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithVariants: Story = {
  args: {},
};
