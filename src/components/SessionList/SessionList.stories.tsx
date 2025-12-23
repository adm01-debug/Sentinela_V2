import type { Meta, StoryObj } from '@storybook/react';
import { SessionList } from './SessionList';

const meta: Meta<typeof SessionList> = {
  title: 'Components/SessionList',
  component: SessionList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SessionList>;

export const Default: Story = {};
