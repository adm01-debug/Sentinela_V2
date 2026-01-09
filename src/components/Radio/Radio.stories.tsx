import type { Meta, StoryObj } from '@storybook/react';
import { Radio, RadioGroup } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/Radio',
  component: RadioGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'option',
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
      { value: 'c', label: 'Option C' },
    ],
  },
};
export const Horizontal: Story = { args: { ...Default.args, direction: 'horizontal' } };
export const WithDefault: Story = { args: { ...Default.args, defaultValue: 'b' } };
export const Disabled: Story = { args: { ...Default.args, disabled: true } };
