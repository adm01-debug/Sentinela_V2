import type { Meta, StoryObj } from '@storybook/react';
import { Menu, MenuItem, MenuDivider } from './Menu';

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <MenuItem>New File</MenuItem>
        <MenuItem>Open</MenuItem>
        <MenuItem>Save</MenuItem>
        <MenuDivider />
        <MenuItem>Exit</MenuItem>
      </>
    ),
  },
};
export const WithShortcuts: Story = {
  args: {
    children: (
      <>
        <MenuItem shortcut="⌘N">New</MenuItem>
        <MenuItem shortcut="⌘O">Open</MenuItem>
        <MenuItem shortcut="⌘S">Save</MenuItem>
      </>
    ),
  },
};
export const WithSubmenu: Story = {
  args: {
    children: (
      <>
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem submenu={<><MenuItem>Plain Text</MenuItem><MenuItem>Rich Text</MenuItem></>}>Paste Special</MenuItem>
      </>
    ),
  },
};
