import type { Meta, StoryObj } from '@storybook/react';
import { aspectratio } from './aspectratio';

const meta: Meta<typeof aspectratio> = {
  title: 'UI/aspectratio',
  component: aspectratio,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof aspectratio>;

export const Default: Story = {};
