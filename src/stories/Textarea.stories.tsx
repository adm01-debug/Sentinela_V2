import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Textarea component for multi-line text input.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text lines',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'This is some pre-filled content that demonstrates how the textarea looks with text inside it.',
  },
};

export const CustomRows: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Small (2 rows)</Label>
        <Textarea placeholder="Small textarea" rows={2} className="min-h-[60px]" />
      </div>
      <div className="grid gap-2">
        <Label>Default (4 rows)</Label>
        <Textarea placeholder="Default textarea" rows={4} />
      </div>
      <div className="grid gap-2">
        <Label>Large (8 rows)</Label>
        <Textarea placeholder="Large textarea" rows={8} className="min-h-[200px]" />
      </div>
    </div>
  ),
};

export const WithCharacterCount: Story = {
  render: () => {
    const maxLength = 280;
    return (
      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself..."
          maxLength={maxLength}
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground text-right">
          0/{maxLength} characters
        </p>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="subject">Subject</Label>
        <input
          id="subject"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="What's this about?"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your issue in detail..."
          rows={5}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Submit</Button>
      </div>
    </div>
  ),
};

export const ResizeOptions: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>No resize</Label>
        <Textarea placeholder="Cannot resize" className="resize-none" />
      </div>
      <div className="grid gap-2">
        <Label>Vertical resize only</Label>
        <Textarea placeholder="Resize vertically" className="resize-y" />
      </div>
      <div className="grid gap-2">
        <Label>Both directions (default)</Label>
        <Textarea placeholder="Resize any direction" className="resize" />
      </div>
    </div>
  ),
};
