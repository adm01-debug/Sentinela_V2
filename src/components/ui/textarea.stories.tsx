import type { Meta, StoryObj } from '@storybook/react';
import { textarea } from './textarea';

const meta: Meta<typeof textarea> = {
  title: 'UI/textarea',
  component: textarea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof textarea>;

export const Default: Story = {};
