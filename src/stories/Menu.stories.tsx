import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Menu = (props: any) => <div className="p-4 border rounded" {...props}>Menu Component</div>;
const meta: Meta<typeof Menu> = { title: 'Components/Menu', component: Menu, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
