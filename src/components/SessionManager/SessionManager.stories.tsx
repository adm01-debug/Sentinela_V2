import type { Meta, StoryObj } from '@storybook/react';
import { SessionManager } from './SessionManager';

const meta: Meta<typeof SessionManager> = {
  title: 'Components/SessionManager',
  component: SessionManager,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SessionManager>;

export const Default: Story = {};
