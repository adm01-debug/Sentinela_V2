import type { Meta, StoryObj } from '@storybook/react';
import { contextmenu } from './contextmenu';

const meta: Meta<typeof contextmenu> = {
  title: 'UI/contextmenu',
  component: contextmenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof contextmenu>;

export const Default: Story = {};
