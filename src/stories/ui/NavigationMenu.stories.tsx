import type { Meta, StoryObj } from '@storybook/react';
import { NavigationMenu } from '@/components/ui/navigation-menu';

const meta: Meta<typeof NavigationMenu> = {
  title: 'UI/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // Interactive test
  },
};
