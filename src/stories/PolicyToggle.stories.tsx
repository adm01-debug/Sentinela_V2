import type { Meta, StoryObj } from '@storybook/react';
import { PolicyToggle } from '@/components/PolicyToggle';

const meta: Meta<typeof PolicyToggle> = {
  title: 'Components/PolicyToggle',
  component: PolicyToggle,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof PolicyToggle>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
