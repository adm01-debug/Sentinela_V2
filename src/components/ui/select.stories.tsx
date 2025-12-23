import type { Meta, StoryObj } from '@storybook/react';
import { select } from './select';

const meta: Meta<typeof select> = {
  title: 'UI/select',
  component: select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof select>;

export const Default: Story = {};
