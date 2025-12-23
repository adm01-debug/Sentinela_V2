import type { Meta, StoryObj } from '@storybook/react';
import { menubar } from './menubar';

const meta: Meta<typeof menubar> = {
  title: 'UI/menubar',
  component: menubar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof menubar>;

export const Default: Story = {};
