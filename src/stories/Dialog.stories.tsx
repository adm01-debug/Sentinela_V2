import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Dialog = (props: any) => <div className="p-4 border rounded" {...props}>Dialog Component</div>;
const meta: Meta<typeof Dialog> = { title: 'Components/Dialog', component: Dialog, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
