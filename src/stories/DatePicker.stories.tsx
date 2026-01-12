import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const DatePicker = (props: any) => <div className="p-4 border rounded" {...props}>DatePicker Component</div>;
const meta: Meta<typeof DatePicker> = { title: 'Components/DatePicker', component: DatePicker, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
