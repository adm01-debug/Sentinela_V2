import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Skeleton = (props: any) => <div className="p-4 border rounded" {...props}>Skeleton Component</div>;
const meta: Meta<typeof Skeleton> = { title: 'Components/Skeleton', component: Skeleton, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
