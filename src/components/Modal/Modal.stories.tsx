import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from '../Button/Button';
import { useState } from 'react';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { isOpen: true, title: 'Modal Title', children: 'Modal content goes here.' },
};
export const WithFooter: Story = {
  args: {
    isOpen: true,
    title: 'Confirm Action',
    children: 'Are you sure you want to proceed?',
    footer: <><Button variant="outline">Cancel</Button><Button>Confirm</Button></>,
  },
};
export const Large: Story = { args: { isOpen: true, title: 'Large Modal', size: 'lg', children: 'Large content area' } };
export const FullScreen: Story = { args: { isOpen: true, title: 'Fullscreen', fullScreen: true, children: 'Full screen content' } };
export const NoCloseButton: Story = { args: { isOpen: true, title: 'No Close', showCloseButton: false, children: 'Content' } };
