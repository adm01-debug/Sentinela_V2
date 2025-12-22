import type { Meta, StoryObj } from '@storybook/react';
import { ApplicationCard } from './ApplicationCard';

const meta: Meta<typeof ApplicationCard> = {
  title: 'Components/ApplicationCard',
  component: ApplicationCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ApplicationCard>;

export const Default: Story = {};
