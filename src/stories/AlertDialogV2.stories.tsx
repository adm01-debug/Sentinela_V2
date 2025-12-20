import type { Meta, StoryObj } from '@storybook/react';

const AlertDialogV2Component = () => <div>AlertDialogV2 Component</div>;

const meta: Meta<typeof AlertDialogV2Component> = {
  title: 'UI/AlertDialogV2',
  component: AlertDialogV2Component,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Variants: Story = {
  args: {},
};

export const Interactive: Story = {
  args: {},
};
