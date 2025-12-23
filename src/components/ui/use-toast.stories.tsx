import type { Meta, StoryObj } from '@storybook/react';
import { usetoast } from './usetoast';

const meta: Meta<typeof usetoast> = {
  title: 'UI/usetoast',
  component: usetoast,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof usetoast>;

export const Default: Story = {};
