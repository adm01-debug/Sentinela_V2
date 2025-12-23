import type { Meta, StoryObj } from '@storybook/react';
import { scrollarea } from './scrollarea';

const meta: Meta<typeof scrollarea> = {
  title: 'UI/scrollarea',
  component: scrollarea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof scrollarea>;

export const Default: Story = {};
