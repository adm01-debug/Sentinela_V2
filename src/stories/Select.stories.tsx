import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Select = (props: any) => (
  <select className="w-full p-2 border rounded" {...props}>
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
  </select>
);

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
