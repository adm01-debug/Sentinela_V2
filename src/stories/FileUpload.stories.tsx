import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from '../components/ui/FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'UI/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  args: {
    onFilesSelected: (files) => console.log('Files:', files),
    accept: '*/*',
    multiple: true,
  },
};

export const ImagesOnly: Story = {
  args: {
    onFilesSelected: (files) => console.log('Files:', files),
    accept: 'image/*',
    multiple: true,
    maxSize: 5 * 1024 * 1024,
  },
};

export const SingleFile: Story = {
  args: {
    onFilesSelected: (files) => console.log('File:', files[0]),
    multiple: false,
  },
};

export const WithPreview: Story = {
  args: {
    onFilesSelected: (files) => console.log('Files:', files),
    showPreview: true,
    accept: 'image/*',
  },
};

export const Disabled: Story = {
  args: {
    onFilesSelected: () => {},
    disabled: true,
  },
};
