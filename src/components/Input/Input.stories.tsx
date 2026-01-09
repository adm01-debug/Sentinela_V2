import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Enter text...' } };
export const WithLabel: Story = { args: { label: 'Email', placeholder: 'email@example.com' } };
export const WithError: Story = { args: { label: 'Email', error: 'Invalid email address', value: 'invalid' } };
export const Password: Story = { args: { type: 'password', label: 'Password', placeholder: '••••••••' } };
export const Search: Story = { args: { type: 'search', placeholder: 'Search...', leftIcon: '🔍' } };
export const Disabled: Story = { args: { disabled: true, value: 'Disabled input' } };
export const Small: Story = { args: { size: 'sm', placeholder: 'Small input' } };
export const Large: Story = { args: { size: 'lg', placeholder: 'Large input' } };
