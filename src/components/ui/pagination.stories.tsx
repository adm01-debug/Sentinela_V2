import type { Meta, StoryObj } from '@storybook/react';
import { pagination } from './pagination';

const meta: Meta<typeof pagination> = {
  title: 'UI/pagination',
  component: pagination,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof pagination>;

export const Default: Story = {};
