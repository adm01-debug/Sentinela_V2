import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Type your message here...' } };
export const Disabled: Story = { args: { placeholder: 'Disabled', disabled: true } };

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
};
