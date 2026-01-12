import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Textarea = (props: any) => <textarea className="w-full p-2 border rounded" rows={4} placeholder="Enter text..." {...props} />;

const meta: Meta<typeof Textarea> = { title: 'Components/Textarea', component: Textarea, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
