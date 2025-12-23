import type { Meta, StoryObj } from '@storybook/react';
import { accordion } from './accordion';

const meta: Meta<typeof accordion> = {
  title: 'UI/accordion',
  component: accordion,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof accordion>;

export const Default: Story = {};
