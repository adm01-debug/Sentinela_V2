import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const DataTable = (props: any) => <div className="p-4 border rounded" {...props}>DataTable Component</div>;
const meta: Meta<typeof DataTable> = { title: 'Components/DataTable', component: DataTable, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
