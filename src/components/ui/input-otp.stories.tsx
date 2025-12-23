import type { Meta, StoryObj } from '@storybook/react';
import { inputotp } from './inputotp';

const meta: Meta<typeof inputotp> = {
  title: 'UI/inputotp',
  component: inputotp,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof inputotp>;

export const Default: Story = {};
