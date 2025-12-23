import type { Meta, StoryObj } from '@storybook/react';
import { TeamSelector } from './TeamSelector';

const meta: Meta<typeof TeamSelector> = {
  title: 'Components/TeamSelector',
  component: TeamSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TeamSelector>;

export const Default: Story = {};
