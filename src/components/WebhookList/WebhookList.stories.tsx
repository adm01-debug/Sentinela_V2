import type { Meta, StoryObj } from '@storybook/react';
import { WebhookList } from './WebhookList';

const meta: Meta<typeof WebhookList> = {
  title: 'Components/WebhookList',
  component: WebhookList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WebhookList>;

export const Default: Story = {};
