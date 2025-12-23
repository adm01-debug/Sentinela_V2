import type { Meta, StoryObj } from '@storybook/react';
import { ScreenshotPreview } from './ScreenshotPreview';

const meta: Meta<typeof ScreenshotPreview> = {
  title: 'Components/ScreenshotPreview',
  component: ScreenshotPreview,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScreenshotPreview>;

export const Default: Story = {};
