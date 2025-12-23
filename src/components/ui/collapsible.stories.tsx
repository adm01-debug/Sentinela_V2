import type { Meta, StoryObj } from '@storybook/react';
import { collapsible } from './collapsible';

const meta: Meta<typeof collapsible> = {
  title: 'UI/collapsible',
  component: collapsible,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof collapsible>;

export const Default: Story = {};
