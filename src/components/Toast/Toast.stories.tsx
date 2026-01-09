import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { type: 'success', message: 'Operation completed successfully!' } };
export const Error: Story = { args: { type: 'error', message: 'An error occurred.' } };
export const Warning: Story = { args: { type: 'warning', message: 'Please review your input.' } };
export const Info: Story = { args: { type: 'info', message: 'New update available.' } };
export const WithTitle: Story = { args: { type: 'success', title: 'Saved!', message: 'Your changes have been saved.' } };
export const WithAction: Story = { args: { type: 'info', message: 'File deleted.', action: { label: 'Undo', onClick: () => {} } } };
export const Persistent: Story = { args: { type: 'warning', message: 'This stays visible', persistent: true } };
