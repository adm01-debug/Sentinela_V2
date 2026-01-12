import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Input = (props: any) => (
  <input className="w-full p-2 border rounded" placeholder="Enter text..." {...props} />
);

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const WithValue: Story = { args: { defaultValue: 'Hello World' } };
