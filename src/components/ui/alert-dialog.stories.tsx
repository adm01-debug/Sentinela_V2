import type { Meta, StoryObj } from '@storybook/react';
import { alertdialog } from './alertdialog';

const meta: Meta<typeof alertdialog> = {
  title: 'UI/alertdialog',
  component: alertdialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof alertdialog>;

export const Default: Story = {};
