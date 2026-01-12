import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Switch = (props: any) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" {...props} />
    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600"></div>
  </label>
);

const meta: Meta<typeof Switch> = { title: 'Components/Switch', component: Switch, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
