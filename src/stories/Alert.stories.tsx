import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Alert = (props: any) => <div className="p-4 border rounded" {...props}>Alert Component</div>;
const meta: Meta<typeof Alert> = { title: 'Components/Alert', component: Alert, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
