import type { Meta, StoryObj } from '@storybook/react';
import { a11yinput } from './a11yinput';

const meta: Meta<typeof a11yinput> = {
  title: 'UI/a11yinput',
  component: a11yinput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof a11yinput>;

export const Default: Story = {};
