import type { Meta, StoryObj } from '@storybook/react';
import { badge } from './badge';

const meta: Meta<typeof badge> = {
  title: 'UI/badge',
  component: badge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof badge>;

export const Default: Story = {};
