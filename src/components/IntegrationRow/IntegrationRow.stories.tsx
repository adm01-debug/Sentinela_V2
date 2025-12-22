import type { Meta, StoryObj } from '@storybook/react';
import { IntegrationRow } from './IntegrationRow';

const meta: Meta<typeof IntegrationRow> = {
  title: 'Components/IntegrationRow',
  component: IntegrationRow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IntegrationRow>;

export const Default: Story = {};
