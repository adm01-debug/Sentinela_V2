import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { isOpen: true, title: 'Drawer', children: 'Drawer content' } };
export const Left: Story = { args: { isOpen: true, placement: 'left', title: 'Left Drawer', children: 'Content' } };
export const Right: Story = { args: { isOpen: true, placement: 'right', title: 'Right Drawer', children: 'Content' } };
export const Bottom: Story = { args: { isOpen: true, placement: 'bottom', title: 'Bottom Drawer', children: 'Content' } };
export const Large: Story = { args: { isOpen: true, size: 'lg', title: 'Large Drawer', children: 'Large content area' } };
