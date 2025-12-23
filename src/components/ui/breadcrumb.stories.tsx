import type { Meta, StoryObj } from '@storybook/react';
import { breadcrumb } from './breadcrumb';

const meta: Meta<typeof breadcrumb> = {
  title: 'UI/breadcrumb',
  component: breadcrumb,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof breadcrumb>;

export const Default: Story = {};
