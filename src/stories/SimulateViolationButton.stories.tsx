import type { Meta, StoryObj } from '@storybook/react';
import { SimulateViolationButton } from '@/components/SimulateViolationButton';

const meta: Meta<typeof SimulateViolationButton> = {
  title: 'Components/SimulateViolationButton',
  component: SimulateViolationButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SimulateViolationButton>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
