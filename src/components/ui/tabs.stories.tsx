import type { Meta, StoryObj } from '@storybook/react';
import { tabs } from './tabs';

const meta: Meta<typeof tabs> = {
  title: 'UI/tabs',
  component: tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof tabs>;

export const Default: Story = {};
