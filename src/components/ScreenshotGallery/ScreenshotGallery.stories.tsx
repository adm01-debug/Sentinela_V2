import type { Meta, StoryObj } from '@storybook/react';
import { ScreenshotGallery } from './ScreenshotGallery';

const meta: Meta<typeof ScreenshotGallery> = {
  title: 'Components/ScreenshotGallery',
  component: ScreenshotGallery,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScreenshotGallery>;

export const Default: Story = {};
