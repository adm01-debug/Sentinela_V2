import type { Meta, StoryObj } from '@storybook/react';
import { ViolationForm } from './ViolationForm';

const meta: Meta<typeof ViolationForm> = {
  title: 'Components/ViolationForm',
  component: ViolationForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ViolationForm>;

export const Default: Story = {};
