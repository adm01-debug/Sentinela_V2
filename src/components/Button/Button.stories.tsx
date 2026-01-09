import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: 'Primary Button', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Secondary Button', variant: 'secondary' } };
export const Outline: Story = { args: { children: 'Outline Button', variant: 'outline' } };
export const Ghost: Story = { args: { children: 'Ghost Button', variant: 'ghost' } };
export const Danger: Story = { args: { children: 'Danger Button', variant: 'danger' } };
export const Small: Story = { args: { children: 'Small Button', size: 'sm' } };
export const Large: Story = { args: { children: 'Large Button', size: 'lg' } };
export const Disabled: Story = { args: { children: 'Disabled', disabled: true } };
export const Loading: Story = { args: { children: 'Loading...', loading: true } };
export const WithIcon: Story = { args: { children: '+ Add Item', variant: 'primary' } };
