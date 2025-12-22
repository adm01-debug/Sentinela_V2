import type { Meta, StoryObj } from '@storybook/react';
import { AlertItem } from './AlertItem';

const meta: Meta<typeof AlertItem> = {
  title: 'Components/AlertItem',
  component: AlertItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AlertItem>;

export const Default: Story = {};
