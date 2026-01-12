import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const Modal = ({ open = true, title = 'Modal Title' }: any) => open ? (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p>Modal content goes here</p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
    </div>
  </div>
) : null;

const meta: Meta<typeof Modal> = { title: 'Components/Modal', component: Modal, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
