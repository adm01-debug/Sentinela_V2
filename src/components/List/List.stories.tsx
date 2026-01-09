import type { Meta, StoryObj } from '@storybook/react';
import { List, ListItem } from './List';

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
        <ListItem>Item 3</ListItem>
      </>
    ),
  },
};
export const WithDividers: Story = { args: { ...Default.args, divided: true } };
export const Clickable: Story = {
  args: {
    children: (
      <>
        <ListItem clickable>Clickable item 1</ListItem>
        <ListItem clickable>Clickable item 2</ListItem>
      </>
    ),
  },
};
export const WithIcons: Story = {
  args: {
    children: (
      <>
        <ListItem icon="📁">Documents</ListItem>
        <ListItem icon="📷">Photos</ListItem>
        <ListItem icon="🎵">Music</ListItem>
      </>
    ),
  },
};
