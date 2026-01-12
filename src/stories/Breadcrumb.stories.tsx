import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Breadcrumb = (props: any) => <div className="p-4 border rounded" {...props}>Breadcrumb Component</div>;
const meta: Meta<typeof Breadcrumb> = { title: 'Components/Breadcrumb', component: Breadcrumb, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
