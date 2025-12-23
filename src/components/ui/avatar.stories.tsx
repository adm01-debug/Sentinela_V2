import type { Meta, StoryObj } from '@storybook/react';
import { avatar } from './avatar';

const meta: Meta<typeof avatar> = {
  title: 'UI/avatar',
  component: avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof avatar>;

export const Default: Story = {};
