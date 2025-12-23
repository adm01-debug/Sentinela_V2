import type { Meta, StoryObj } from '@storybook/react';
import { ScreenshotViewer } from './ScreenshotViewer';

const meta: Meta<typeof ScreenshotViewer> = {
  title: 'Components/ScreenshotViewer',
  component: ScreenshotViewer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScreenshotViewer>;

export const Default: Story = {};
