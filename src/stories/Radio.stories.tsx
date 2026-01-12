import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Radio = () => (
  <div className="flex flex-col gap-2">
    <label className="flex items-center gap-2"><input type="radio" name="option" /> Option 1</label>
    <label className="flex items-center gap-2"><input type="radio" name="option" /> Option 2</label>
  </div>
);

const meta: Meta<typeof Radio> = { title: 'Components/Radio', component: Radio, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
