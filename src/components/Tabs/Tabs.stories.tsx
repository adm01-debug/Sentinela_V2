import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, Tab } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Tab label="Tab 1">Content for Tab 1</Tab>
        <Tab label="Tab 2">Content for Tab 2</Tab>
        <Tab label="Tab 3">Content for Tab 3</Tab>
      </>
    ),
  },
};
export const WithIcons: Story = {
  args: {
    children: (
      <>
        <Tab label="Home" icon="🏠">Home content</Tab>
        <Tab label="Settings" icon="⚙️">Settings content</Tab>
      </>
    ),
  },
};
export const Vertical: Story = { args: { ...Default.args, orientation: 'vertical' } };
export const Pills: Story = { args: { ...Default.args, variant: 'pills' } };
export const Disabled: Story = {
  args: {
    children: (
      <>
        <Tab label="Active">Active tab</Tab>
        <Tab label="Disabled" disabled>Disabled content</Tab>
      </>
    ),
  },
};
