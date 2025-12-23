import type { Meta, StoryObj } from '@storybook/react';
import { separator } from './separator';

const meta: Meta<typeof separator> = {
  title: 'UI/separator',
  component: separator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof separator>;

export const Default: Story = {};
