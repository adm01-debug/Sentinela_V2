import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Enter your message...' } };
export const WithLabel: Story = { args: { label: 'Description', placeholder: 'Describe...' } };
export const WithError: Story = { args: { label: 'Bio', error: 'Too long', maxLength: 100 } };
export const Disabled: Story = { args: { disabled: true, value: 'Read only content' } };
export const AutoResize: Story = { args: { autoResize: true, placeholder: 'Auto-resizing...' } };
export const WithCounter: Story = { args: { showCount: true, maxLength: 200 } };
