import type { Meta, StoryObj } from '@storybook/react';
import { navigationmenu } from './navigationmenu';

const meta: Meta<typeof navigationmenu> = {
  title: 'UI/navigationmenu',
  component: navigationmenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof navigationmenu>;

export const Default: Story = {};
