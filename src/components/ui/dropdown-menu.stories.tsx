import type { Meta, StoryObj } from '@storybook/react';
import { dropdownmenu } from './dropdownmenu';

const meta: Meta<typeof dropdownmenu> = {
  title: 'UI/dropdownmenu',
  component: dropdownmenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof dropdownmenu>;

export const Default: Story = {};
