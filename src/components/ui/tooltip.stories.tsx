import type { Meta, StoryObj } from '@storybook/react';
import { tooltip } from './tooltip';

const meta: Meta<typeof tooltip> = {
  title: 'UI/tooltip',
  component: tooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof tooltip>;

export const Default: Story = {};
