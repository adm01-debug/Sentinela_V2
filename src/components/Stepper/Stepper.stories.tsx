import type { Meta, StoryObj } from '@storybook/react';
import { Stepper, Step } from './Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentStep: 1,
    children: (
      <>
        <Step title="Account" description="Create account" />
        <Step title="Profile" description="Setup profile" />
        <Step title="Complete" description="All done" />
      </>
    ),
  },
};
export const Vertical: Story = { args: { ...Default.args, orientation: 'vertical' } };
export const WithError: Story = {
  args: {
    currentStep: 1,
    children: (
      <>
        <Step title="Step 1" status="complete" />
        <Step title="Step 2" status="error" description="Please fix errors" />
        <Step title="Step 3" />
      </>
    ),
  },
};
export const Clickable: Story = { args: { ...Default.args, clickable: true } };
