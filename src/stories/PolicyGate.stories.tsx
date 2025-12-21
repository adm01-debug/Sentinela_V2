import type { Meta, StoryObj } from '@storybook/react';
import { PolicyGate } from '@/components/PolicyGate';

const meta: Meta<typeof PolicyGate> = {
  title: 'Components/PolicyGate',
  component: PolicyGate,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof PolicyGate>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
