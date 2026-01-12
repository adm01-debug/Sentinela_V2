import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Tabs = (props: any) => <div className="p-4 border rounded" {...props}>Tabs Component</div>;
const meta: Meta<typeof Tabs> = { title: 'Components/Tabs', component: Tabs, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
