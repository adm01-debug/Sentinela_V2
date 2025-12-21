import type { Meta, StoryObj } from '@storybook/react';
import { A11yInput } from '@/components/ui/a11y-input';

const meta: Meta<typeof A11yInput> = {
  title: 'UI/A11yInput',
  component: A11yInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // Interactive test
  },
};
