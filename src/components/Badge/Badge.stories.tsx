import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Badge' } };
export const Primary: Story = { args: { children: 'Primary', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Secondary', variant: 'secondary' } };
export const Success: Story = { args: { children: 'Success', variant: 'success' } };
export const Warning: Story = { args: { children: 'Warning', variant: 'warning' } };
export const Danger: Story = { args: { children: 'Danger', variant: 'danger' } };
export const Outline: Story = { args: { children: 'Outline', variant: 'outline' } };
export const WithDot: Story = { args: { children: 'Active', dot: true, variant: 'success' } };
export const Removable: Story = { args: { children: 'Tag', removable: true, onRemove: () => {} } };
