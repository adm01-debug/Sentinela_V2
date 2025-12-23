import type { Meta, StoryObj } from '@storybook/react';
import { toast } from './toast';

const meta: Meta<typeof toast> = {
  title: 'UI/toast',
  component: toast,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof toast>;

export const Default: Story = {};
