import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Dropdown = (props: any) => <div className="p-4 border rounded" {...props}>Dropdown Component</div>;
const meta: Meta<typeof Dropdown> = { title: 'Components/Dropdown', component: Dropdown, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
