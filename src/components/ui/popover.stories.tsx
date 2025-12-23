import type { Meta, StoryObj } from '@storybook/react';
import { popover } from './popover';

const meta: Meta<typeof popover> = {
  title: 'UI/popover',
  component: popover,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof popover>;

export const Default: Story = {};
