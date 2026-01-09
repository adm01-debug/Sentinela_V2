import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { type: 'success', title: 'Success', children: 'Your action was successful.' } };
export const Error: Story = { args: { type: 'error', title: 'Error', children: 'Something went wrong.' } };
export const Warning: Story = { args: { type: 'warning', title: 'Warning', children: 'Please be careful.' } };
export const Info: Story = { args: { type: 'info', title: 'Info', children: 'Here is some information.' } };
export const Dismissible: Story = { args: { type: 'info', title: 'Dismissible', children: 'Click X to close', dismissible: true } };
export const WithIcon: Story = { args: { type: 'success', children: 'With custom icon', icon: '✓' } };
