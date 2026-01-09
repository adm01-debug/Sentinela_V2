import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown, DropdownItem } from './Dropdown';
import { Button } from '../Button/Button';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button>Open Menu</Button>,
    children: (
      <>
        <DropdownItem>Item 1</DropdownItem>
        <DropdownItem>Item 2</DropdownItem>
        <DropdownItem>Item 3</DropdownItem>
      </>
    ),
  },
};
export const WithDivider: Story = {
  args: {
    trigger: <Button>Actions</Button>,
    children: (
      <>
        <DropdownItem>Edit</DropdownItem>
        <DropdownItem>Duplicate</DropdownItem>
        <DropdownItem divider />
        <DropdownItem danger>Delete</DropdownItem>
      </>
    ),
  },
};
export const WithIcons: Story = {
  args: {
    trigger: <Button>Menu</Button>,
    children: (
      <>
        <DropdownItem icon="📝">Edit</DropdownItem>
        <DropdownItem icon="📋">Copy</DropdownItem>
        <DropdownItem icon="🗑️" danger>Delete</DropdownItem>
      </>
    ),
  },
};
