import type { Meta, StoryObj } from '@storybook/react';
import { a11ybutton } from './a11ybutton';

const meta: Meta<typeof a11ybutton> = {
  title: 'UI/a11ybutton',
  component: a11ybutton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof a11ybutton>;

export const Default: Story = {};
