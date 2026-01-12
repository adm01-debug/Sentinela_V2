import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Avatar = (props: any) => <div className="p-4 border rounded" {...props}>Avatar Component</div>;
const meta: Meta<typeof Avatar> = { title: 'Components/Avatar', component: Avatar, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
