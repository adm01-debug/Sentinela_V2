import type { Meta, StoryObj } from '@storybook/react';
import { checkbox } from './checkbox';

const meta: Meta<typeof checkbox> = {
  title: 'UI/checkbox',
  component: checkbox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof checkbox>;

export const Default: Story = {};
