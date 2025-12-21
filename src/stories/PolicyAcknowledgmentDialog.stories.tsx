import type { Meta, StoryObj } from '@storybook/react';
import { PolicyAcknowledgmentDialog } from '@/components/PolicyAcknowledgmentDialog';

const meta: Meta<typeof PolicyAcknowledgmentDialog> = {
  title: 'Components/PolicyAcknowledgmentDialog',
  component: PolicyAcknowledgmentDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof PolicyAcknowledgmentDialog>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
