import type { Meta, StoryObj } from '@storybook/react';
import { ContextMenu } from '@/components/ui/contextmenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'UI/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithProps: Story = {
  args: {},
};
