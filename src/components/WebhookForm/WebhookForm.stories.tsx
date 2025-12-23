import type { Meta, StoryObj } from '@storybook/react';
import { WebhookForm } from './WebhookForm';

const meta: Meta<typeof WebhookForm> = {
  title: 'Components/WebhookForm',
  component: WebhookForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WebhookForm>;

export const Default: Story = {};
