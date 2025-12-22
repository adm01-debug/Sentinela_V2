import type { Meta, StoryObj } from '@storybook/react';
import { PolicyForm } from './PolicyForm';

const meta: Meta<typeof PolicyForm> = {
  title: 'Components/PolicyForm',
  component: PolicyForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PolicyForm>;

export const Default: Story = {};
