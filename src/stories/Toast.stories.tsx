import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Toast = (props: any) => <div className="p-4 border rounded" {...props}>Toast Component</div>;
const meta: Meta<typeof Toast> = { title: 'Components/Toast', component: Toast, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
