import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const SearchInput = (props: any) => <div className="p-4 border rounded" {...props}>SearchInput Component</div>;
const meta: Meta<typeof SearchInput> = { title: 'Components/SearchInput', component: SearchInput, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
