import type { Meta, StoryObj } from '@storybook/react';
import { ScreenshotStats } from './ScreenshotStats';

const meta: Meta<typeof ScreenshotStats> = {
  title: 'Components/ScreenshotStats',
  component: ScreenshotStats,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScreenshotStats>;

export const Default: Story = {};
