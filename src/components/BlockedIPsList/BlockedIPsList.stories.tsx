import type { Meta, StoryObj } from '@storybook/react';
import { BlockedIPsList } from './BlockedIPsList';

const meta: Meta<typeof BlockedIPsList> = {
  title: 'Components/BlockedIPsList',
  component: BlockedIPsList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BlockedIPsList>;

export const Default: Story = {};
