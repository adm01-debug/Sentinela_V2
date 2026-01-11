import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/ui/Button';

const meta: Meta<typeof Button> = { title: 'UI/Button', component: Button, tags: ['autodocs'], argTypes: { variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] }, size: { control: 'select', options: ['sm', 'md', 'lg'] } } };

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'Button', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Button', variant: 'secondary' } };
export const Destructive: Story = { args: { children: 'Delete', variant: 'destructive' } };
export const Loading: Story = { args: { children: 'Loading', loading: true } };
export const Small: Story = { args: { children: 'Small', size: 'sm' } };
export const Large: Story = { args: { children: 'Large', size: 'lg' } };