import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from '../components/ui/drawer';

const meta: Meta<typeof Drawer> = {
  title: 'UI/Drawer',
  component: Drawer,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
