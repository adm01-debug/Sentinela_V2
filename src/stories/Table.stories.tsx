import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Table = (props: any) => <div className="p-4 border rounded" {...props}>Table Component</div>;
const meta: Meta<typeof Table> = { title: 'Components/Table', component: Table, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
