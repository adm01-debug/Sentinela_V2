import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Badge = (props: any) => <div className="p-4 border rounded" {...props}>Badge Component</div>;
const meta: Meta<typeof Badge> = { title: 'Components/Badge', component: Badge, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
