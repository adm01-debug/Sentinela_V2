import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Checkbox = (props: any) => (
  <label className="flex items-center gap-2">
    <input type="checkbox" {...props} />
    <span>Checkbox label</span>
  </label>
);

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
