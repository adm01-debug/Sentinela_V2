import type { Meta, StoryObj } from '@storybook/react';
import { ProgressRing } from './ProgressRing';

const meta: Meta<typeof ProgressRing> = {
  title: 'Components/ProgressRing',
  component: ProgressRing,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProgressRing>;

export const Default: Story = {};
