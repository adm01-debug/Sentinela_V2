import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Pagination = (props: any) => <div className="p-4 border rounded" {...props}>Pagination Component</div>;
const meta: Meta<typeof Pagination> = { title: 'Components/Pagination', component: Pagination, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
