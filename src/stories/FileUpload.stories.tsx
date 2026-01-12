import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const FileUpload = (props: any) => <div className="p-4 border rounded" {...props}>FileUpload Component</div>;
const meta: Meta<typeof FileUpload> = { title: 'Components/FileUpload', component: FileUpload, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
