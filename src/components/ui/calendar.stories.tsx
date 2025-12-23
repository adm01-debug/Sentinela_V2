import type { Meta, StoryObj } from '@storybook/react';
import { calendar } from './calendar';

const meta: Meta<typeof calendar> = {
  title: 'UI/calendar',
  component: calendar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof calendar>;

export const Default: Story = {};
