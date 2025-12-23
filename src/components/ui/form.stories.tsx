import type { Meta, StoryObj } from '@storybook/react';
import { form } from './form';

const meta: Meta<typeof form> = {
  title: 'UI/form',
  component: form,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof form>;

export const Default: Story = {};
