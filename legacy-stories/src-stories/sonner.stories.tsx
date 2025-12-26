import type { Meta, StoryObj } from '@storybook/react';
import { Sonner } from '../components/ui/sonner';

const meta: Meta<typeof Sonner> = {
  title: 'UI/Sonner',
  component: Sonner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
