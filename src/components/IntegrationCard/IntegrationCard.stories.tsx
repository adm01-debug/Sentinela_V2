import type { Meta, StoryObj } from '@storybook/react';
import { IntegrationCard } from './IntegrationCard';

const meta: Meta<typeof IntegrationCard> = {
  title: 'Components/IntegrationCard',
  component: IntegrationCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IntegrationCard>;

export const Default: Story = {};
