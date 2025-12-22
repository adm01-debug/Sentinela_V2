import type { Meta, StoryObj } from '@storybook/react';
import { ProfileForm } from './ProfileForm';

const meta: Meta<typeof ProfileForm> = {
  title: 'Components/ProfileForm',
  component: ProfileForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileForm>;

export const Default: Story = {};
