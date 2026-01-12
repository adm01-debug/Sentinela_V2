import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const TimePicker = (props: any) => <div className="p-4 border rounded" {...props}>TimePicker Component</div>;
const meta: Meta<typeof TimePicker> = { title: 'Components/TimePicker', component: TimePicker, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
