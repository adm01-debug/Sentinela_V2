import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Spinner = (props: any) => <div className="p-4 border rounded" {...props}>Spinner Component</div>;
const meta: Meta<typeof Spinner> = { title: 'Components/Spinner', component: Spinner, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
