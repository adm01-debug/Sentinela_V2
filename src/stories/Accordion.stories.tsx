import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
const Accordion = (props: any) => <div className="p-4 border rounded" {...props}>Accordion Component</div>;
const meta: Meta<typeof Accordion> = { title: 'Components/Accordion', component: Accordion, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
