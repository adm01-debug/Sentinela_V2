import type { Meta, StoryObj } from '@storybook/react';
import { table } from './table';

const meta: Meta<typeof table> = {
  title: 'UI/table',
  component: table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof table>;

export const Default: Story = {};
