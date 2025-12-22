import type { Meta, StoryObj } from '@storybook/react';
import { PasswordResetForm } from './PasswordResetForm';

const meta: Meta<typeof PasswordResetForm> = {
  title: 'Components/PasswordResetForm',
  component: PasswordResetForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PasswordResetForm>;

export const Default: Story = {};
