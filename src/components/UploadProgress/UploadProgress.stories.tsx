import type { Meta, StoryObj } from '@storybook/react';
import { UploadProgress } from './UploadProgress';

const meta: Meta<typeof UploadProgress> = {
  title: 'Components/UploadProgress',
  component: UploadProgress,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UploadProgress>;

export const Default: Story = {};
