import type { Meta, StoryObj } from '@storybook/react';
import { QuickActions } from './QuickActions';

const meta: Meta<typeof QuickActions> = {
  title: 'Components/QuickActions',
  component: QuickActions,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QuickActions>;

export const Default: Story = {};
