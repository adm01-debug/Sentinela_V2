import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from '@/components/ui/radio-group';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
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
