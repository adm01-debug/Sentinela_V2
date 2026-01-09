import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Enable notifications' } };
export const Checked: Story = { args: { label: 'Active', checked: true } };
export const Disabled: Story = { args: { label: 'Disabled', disabled: true } };
export const WithDescription: Story = { args: { label: 'Dark Mode', description: 'Use dark theme' } };
export const Small: Story = { args: { label: 'Small', size: 'sm' } };
export const Large: Story = { args: { label: 'Large', size: 'lg' } };
