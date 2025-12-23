import type { Meta, StoryObj } from '@storybook/react';
import { resizable } from './resizable';

const meta: Meta<typeof resizable> = {
  title: 'UI/resizable',
  component: resizable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof resizable>;

export const Default: Story = {};
