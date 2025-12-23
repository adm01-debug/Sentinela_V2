import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmButton } from './ConfirmButton';

const meta: Meta<typeof ConfirmButton> = {
  title: 'UI/ConfirmButton',
  component: ConfirmButton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfirmButton>;

export const Default: Story = {};
